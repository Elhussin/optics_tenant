# from django.test import TransactionTestCase
# from django_tenants.utils import schema_context, connection, get_tenant_model
# from django_tenants.test.client import TenantClient

# from .models import Customer,Interaction,Complaint,Opportunity,Task,Campaign,Document,Subscription
# from django.contrib.auth import get_user_model

# User = get_user_model()

# import uuid

# class CustomerModelTest(TransactionTestCase):
#     def setUp(self):
#         self.schema_name = f'test_{uuid.uuid4().hex[:8]}'
#         with schema_context('public'):
#             tenant_model = get_tenant_model()
#             with connection.cursor() as cursor:
#                 cursor.execute(f'DROP SCHEMA IF EXISTS "{self.schema_name}" CASCADE')
#             self.tenant = tenant_model.objects.create(
#                 schema_name=self.schema_name,
#                 name='Test Tenant',
#                 paid_until='2099-01-01',
#                 on_trial=True
#             )
#             self.tenant.save()
#             self.tenant.create_schema(check_if_exists=True)

#             # ترحيل الجداول داخل schema
#             from django.core.management import call_command
#             call_command('migrate_schemas', schema_name=self.schema_name, interactive=False, run_syncdb=True)

#         connection.set_tenant(self.tenant)

#         self.user = User.objects.create_superuser(
#             username='admin',
#             email='admin@example.com',
#             password='adminpass'
#         )

#     def tearDown(self):
#         connection.set_schema_to_public()
#         with connection.cursor() as cursor:
#             cursor.execute(f'DROP SCHEMA IF EXISTS "{self.schema_name}" CASCADE')
#         self.tenant.delete()

#     def test_customer_str(self):
#         customer = Customer.objects.create(
#             user = User.objects.create_user(username="testuser", password="testpass"),
#             first_name="John",
#             last_name="Doe",
#             identification_number="1234567890",
#             email="john.doe@example.com",
#             phone="1234567890",
#             date_of_birth="1990-01-01",
#             customer_type="individual",
#             address_line1="123 Main St",
#             address_line2="Apt 4B",
#             city="Springfield",
#             postal_code="12345",
#             customer_since="2020-01-01",
#             is_vip=True,
#             loyalty_points=100,
#             accepts_marketing=True,
#             registration_number="REG123456",
#             tax_number="TAX123456",
#             preferred_contact="email",
#             website="https://example.com",
#             logo="logo.png",
#             description="Test customer description"
#         )
#         self.assertEqual(str(customer), "John Doe")

#     def test_interaction_str(self):
#         customer = Customer.objects.create(
#             user = User.objects.create_user(username="testuser", password="testpass"),
#             first_name="John",
#             last_name="Doe",
#             identification_number="1234567890",
#             email="john.doe@example.com",
#             phone="1234567890",
#             date_of_birth="1990-01-01",
#             customer_type="individual",
#             address_line1="123 Main St",
#             address_line2="Apt 4B",
#             city="Springfield",
#             postal_code="12345",
#             customer_since="2020-01-01",
#             is_vip=True,
#             loyalty_points=100,
#             accepts_marketing=True,
#             registration_number="REG123456",
#             tax_number="TAX123456",
#             preferred_contact="email",
#             website="https://example.com",
#             logo="logo.png",
#             description="Test customer description"
#         )
#         interaction = Interaction.objects.create(
#             customer=customer,
#             interaction_type="phone",
#             notes="Test interaction notes"
#         )
#         def __str__(self):
#             return f"{self.interaction_type.capitalize()} with {self.customer.first_name} {self.customer.last_name}"
# CRM/tests/test_customer.py
from core.utils.test_utils import BaseTenantTestCase
from .models import Customer,Interaction
from django.contrib.auth import get_user_model
User = get_user_model()

class CustomerModelTest(BaseTenantTestCase):

    def test_customer_str(self):
        customer = Customer.objects.create(
            user = User.objects.create_user(username="testuser", password="testpass"),
            first_name="John",
            last_name="Doe",
            identification_number="1234567890",
            email="john.doe@example.com",
            phone="1234567890",
            date_of_birth="1990-01-01",
            customer_type="individual",
            address_line1="123 Main St",
            address_line2="Apt 4B",
            city="Springfield",
            postal_code="12345",
            customer_since="2020-01-01",
            is_vip=True,
            loyalty_points=100,
            accepts_marketing=True,
            registration_number="REG123456",
            tax_number="TAX123456",
            preferred_contact="email",
            website="https://example.com",
            logo="logo.png",
            description="Test customer description"
        )
        self.assertEqual(str(customer), "John Doe")

    def test_interaction_str(self):
        customer = Customer.objects.create(
            user = User.objects.create_user(username="testuser", password="testpass"),
            first_name="John",
            last_name="Doe",
            identification_number="1234567890",
            email="john.doe@example.com",
            phone="1234567890",
            date_of_birth="1990-01-01",
            customer_type="individual",
            address_line1="123 Main St",
            address_line2="Apt 4B",
            city="Springfield",
            postal_code="12345",
            customer_since="2020-01-01",
            is_vip=True,
            loyalty_points=100,
            accepts_marketing=True,
            registration_number="REG123456",
            tax_number="TAX123456",
            preferred_contact="email",
            website="https://example.com",
            logo="logo.png",
            description="Test customer description"
        )
        interaction = Interaction.objects.create(
            customer=customer,
            interaction_type="phone",
            notes="Test interaction notes"
        )
        def __str__(self):
            return f"{self.interaction_type.capitalize()} with {self.customer.first_name} {self.customer.last_name}"