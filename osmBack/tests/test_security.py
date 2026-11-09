from types import SimpleNamespace
from unittest.mock import Mock, patch
from unittest import skipUnless

from django.conf import settings
from django.db import connection
from django.test import SimpleTestCase, TestCase
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework_simplejwt.tokens import AccessToken

from core.middleware.CookieJWTAuthentication import CookieJWTAuthentication
from core.permissions.BranchAccessMixin import BranchAccessMixin, TransferBranchAccessMixin
from core.permissions.RoleOrPermissionRequired import RoleOrPermissionRequired
from core.permissions.PaymentBranchAccessMixin import PaymentBranchAccessMixin


def user_with_permissions(*codes, role='SalesClerk', active=True):
    permissions = Mock()
    permissions.values_list.return_value = codes
    roles = Mock()
    roles.all.return_value = [SimpleNamespace(name=role, permissions=permissions)]
    return SimpleNamespace(is_authenticated=True, is_active=active,
                           is_superuser=False, roles=roles, employee=None)


class ActionPermissionTests(SimpleTestCase):
    def setUp(self):
        self.policy = RoleOrPermissionRequired(
            allowed_roles=['SalesClerk'], required_permissions=['view_sale'])
        self.view = SimpleNamespace(action='create', action_permissions={
            'create': ['create_sale'], 'partial_update': ['edit_sale'],
            'destroy': ['delete_sale'], 'cancel': ['cancel_sale']})

    def check(self, user, action='create', method='POST'):
        self.view.action = action
        return self.policy.has_permission(SimpleNamespace(user=user, method=method), self.view)

    def test_read_permission_does_not_grant_any_mutation(self):
        for action, method in [('create', 'POST'), ('partial_update', 'PATCH'),
                               ('destroy', 'DELETE'), ('cancel', 'POST')]:
            with self.subTest(action=action), self.assertRaises(PermissionDenied):
                self.check(user_with_permissions('view_sale'), action, method)

    def test_explicit_create_permission_allows_create(self):
        self.assertTrue(self.check(user_with_permissions('create_sale')))

    def test_create_permission_does_not_allow_cancel(self):
        with self.assertRaises(PermissionDenied):
            self.check(user_with_permissions('create_sale'), 'cancel')

    def test_unknown_write_action_fails_closed(self):
        with self.assertRaises(PermissionDenied):
            self.check(user_with_permissions('*'), 'new_unmapped_action')

    def test_read_and_options_keep_legacy_role_access(self):
        self.assertTrue(self.check(user_with_permissions('view_sale'), 'list', 'GET'))
        self.assertTrue(self.check(user_with_permissions('view_sale'), None, 'OPTIONS'))

    def test_owner_and_wildcard_allow_mapped_action(self):
        self.assertTrue(self.check(user_with_permissions(role='TenantOwner')))
        self.assertTrue(self.check(user_with_permissions('*')))

    def test_disabled_owner_denied(self):
        with self.assertRaises(PermissionDenied):
            self.check(user_with_permissions(role='TenantOwner', active=False))

    def test_legacy_view_still_accepts_role(self):
        request = SimpleNamespace(user=user_with_permissions(), method='POST')
        self.assertTrue(self.policy.has_permission(request, SimpleNamespace()))


class SavingView:
    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()


class ScopedView(BranchAccessMixin, SavingView):
    def get_user_branches(self, user=None):
        return [10]


class BranchWriteTests(SimpleTestCase):
    def serializer(self, data, instance=None):
        return SimpleNamespace(validated_data=data, instance=instance, save=Mock())

    def test_create_other_branch_rejected_before_save(self):
        serializer = self.serializer({'branch': SimpleNamespace(id=20)})
        with self.assertRaises(PermissionDenied):
            ScopedView().perform_create(serializer)
        serializer.save.assert_not_called()

    def test_create_assigned_branch_saved(self):
        serializer = self.serializer({'branch': SimpleNamespace(id=10)})
        ScopedView().perform_create(serializer)
        serializer.save.assert_called_once()

    def test_patch_cannot_move_record_to_other_branch(self):
        serializer = self.serializer({'branch': SimpleNamespace(id=20)},
                                     SimpleNamespace(branch=SimpleNamespace(id=10)))
        with self.assertRaises(PermissionDenied):
            ScopedView().perform_update(serializer)
        serializer.save.assert_not_called()

    def test_patch_uses_existing_branch(self):
        serializer = self.serializer({'notes': 'updated'},
                                     SimpleNamespace(branch=SimpleNamespace(id=10)))
        ScopedView().perform_update(serializer)
        serializer.save.assert_called_once()

    def test_nested_stock_branch_checked_on_create_and_patch(self):
        view = ScopedView()
        view.branch_field = 'stock__branch'
        stock = SimpleNamespace(branch=SimpleNamespace(id=20))
        for data, instance in [({'stock': stock}, None), ({}, SimpleNamespace(stock=stock))]:
            with self.subTest(data=data), self.assertRaises(PermissionDenied):
                view.validate_serializer_branch(self.serializer(data, instance))

    def test_no_employee_means_no_branches(self):
        view = BranchAccessMixin()
        view.request = SimpleNamespace(user=user_with_permissions())
        self.assertEqual(view.get_user_branches(), [])

    def test_owner_has_all_branches(self):
        view = BranchAccessMixin()
        view.request = SimpleNamespace(user=user_with_permissions(role='TenantOwner'))
        self.assertIsNone(view.get_user_branches())


class ObjectView:
    def get_object(self):
        return SimpleNamespace(from_branch=SimpleNamespace(id=20), to_branch=SimpleNamespace(id=10))


class TransferView(TransferBranchAccessMixin, ObjectView):
    def get_user_branches(self, user=None):
        return [10]


class TransferAccessTests(SimpleTestCase):
    def test_receiver_cannot_ship_or_modify_source(self):
        for action in ['ship', 'cancel', 'approve', 'partial_update', 'destroy']:
            view = TransferView()
            view.action = action
            view.request = SimpleNamespace(method='POST')
            with self.subTest(action=action), self.assertRaises(PermissionDenied):
                view.get_object()

    def test_destination_can_receive(self):
        view = TransferView()
        view.action = 'receive'
        view.request = SimpleNamespace(method='POST')
        self.assertIsNotNone(view.get_object())


class TenantTokenTests(SimpleTestCase):
    def authenticate(self, tenant):
        token = AccessToken()
        token['user_id'] = 42
        if tenant is not None:
            token['tenant'] = tenant
        auth = CookieJWTAuthentication()
        request = SimpleNamespace(COOKIES={'access_token': str(token)})
        with patch.object(connection, 'schema_name', 'tenant_a', create=True), \
                patch.object(auth, 'get_user', return_value='authenticated-user') as lookup:
            result = auth.authenticate(request)
            return result, lookup.call_count

    def test_signed_token_missing_tenant_never_looks_up_user(self):
        self.assertEqual(self.authenticate(None), (None, 0))

    def test_signed_token_other_tenant_never_looks_up_user(self):
        self.assertEqual(self.authenticate('tenant_b'), (None, 0))

    def test_matching_tenant_authenticates(self):
        result, calls = self.authenticate('tenant_a')
        self.assertEqual(result[0], 'authenticated-user')
        self.assertEqual(calls, 1)


class PaymentScope(PaymentBranchAccessMixin):
    def get_user_branches(self, user=None):
        return [10]


@skipUnless('tests.security_app' in settings.INSTALLED_APPS, 'Run with tests.security_settings for isolated SQL fixtures')
class PaymentBranchTests(TestCase):
    def setUp(self):
        from tests.security_app.models import Document, Payment, PaymentAllocation
        self.Payment = Payment
        self.Allocation = PaymentAllocation
        self.own_order = Document.objects.create(branch_id=10)
        self.own_invoice = Document.objects.create(branch_id=10, order_id=self.own_order.pk)
        self.other_invoice = Document.objects.create(branch_id=20)

    def visible_ids(self):
        # Use real SQLite joins/subqueries, substituting only the ERP model import.
        with patch.dict('sys.modules', {'apps.sales.models': SimpleNamespace(PaymentAllocation=self.Allocation)}):
            return set(PaymentScope().filter_queryset_by_branch(self.Payment.objects.all()).values_list('pk', flat=True))

    def test_direct_document_links_and_no_document(self):
        own = self.Payment.objects.create(order=self.own_order)
        other = self.Payment.objects.create(invoice=self.other_invoice)
        mixed = self.Payment.objects.create(order=self.own_order, invoice=self.other_invoice)
        unattached = self.Payment.objects.create()
        self.assertEqual(self.visible_ids(), {own.pk})

    def test_allocation_only_payment_visible_when_every_allocation_allowed(self):
        own = self.Payment.objects.create()
        self.Allocation.objects.create(payment=own, invoice=self.own_invoice)
        mixed = self.Payment.objects.create()
        self.Allocation.objects.create(payment=mixed, invoice=self.own_invoice)
        self.Allocation.objects.create(payment=mixed, invoice=self.other_invoice)
        self.assertEqual(self.visible_ids(), {own.pk})

    def test_null_branch_and_foreign_allocation_hide_direct_payment(self):
        from tests.security_app.models import Document
        null_branch = Document.objects.create(branch_id=None)
        payment = self.Payment.objects.create(order=self.own_order, invoice=null_branch)
        allocated = self.Payment.objects.create(order=self.own_order)
        self.Allocation.objects.create(payment=allocated, invoice=self.other_invoice)
        self.assertEqual(self.visible_ids(), set())

    def test_writing_checks_each_link_and_sale_consistency(self):
        scope = PaymentScope()
        own_branch = SimpleNamespace(id=10)
        order = SimpleNamespace(pk=1, branch=own_branch)
        for invoice in [SimpleNamespace(order_id=1, branch=SimpleNamespace(id=20)),
                        SimpleNamespace(order_id=2, branch=own_branch)]:
            serializer = SimpleNamespace(validated_data={'invoice': invoice, 'order': order}, instance=None)
            with self.subTest(invoice=invoice), self.assertRaises((PermissionDenied, ValidationError)):
                scope.validate_serializer_branch(serializer)

    def test_patch_uses_existing_document_and_rejects_removing_all_links(self):
        scope = PaymentScope()
        instance = SimpleNamespace(invoice=None, order=SimpleNamespace(branch=SimpleNamespace(id=10)))
        scope.validate_serializer_branch(SimpleNamespace(validated_data={'notes': 'update'}, instance=instance))
        with self.assertRaises(PermissionDenied):
            scope.validate_serializer_branch(SimpleNamespace(validated_data={'order': None}, instance=instance))
