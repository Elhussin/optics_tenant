from django.db.models import Q
from rest_framework.exceptions import PermissionDenied, ValidationError
from core.permissions.BranchAccessMixin import BranchAccessMixin


class PaymentBranchAccessMixin(BranchAccessMixin):
    """A payment is visible only when all linked documents are in scope."""

    def filter_queryset_by_branch(self, queryset):
        branch_ids = self.get_user_branches()
        if branch_ids is None:
            return queryset
        if not branch_ids:
            return queryset.none()
        from apps.sales.models import PaymentAllocation
        forbidden_allocations = PaymentAllocation.objects.exclude(invoice__branch_id__in=branch_ids)
        return queryset.filter(
            Q(invoice__branch_id__in=branch_ids)
            | Q(order__branch_id__in=branch_ids)
            | Q(allocations__invoice__branch_id__in=branch_ids)
        ).exclude(
            Q(invoice__isnull=False) & ~Q(invoice__branch_id__in=branch_ids)
        ).exclude(
            Q(order__isnull=False) & ~Q(order__branch_id__in=branch_ids)
        ).exclude(allocations__in=forbidden_allocations).distinct()

    def validate_serializer_branch(self, serializer):
        links = [serializer.validated_data.get(name, getattr(serializer.instance, name, None))
                 for name in ('invoice', 'order')]
        documents = [document for document in links if document is not None]
        if not documents:
            if self.get_user_branches() is not None:
                raise PermissionDenied('A payment must reference an accessible invoice or order.')
            return
        for document in documents:
            self.validate_branch_access(document.branch)
        invoice, order = links
        if invoice and order and invoice.order_id != order.pk:
            raise ValidationError({'order': 'Invoice and order must refer to the same sale.'})
