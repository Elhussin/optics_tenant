# tests/test_prescription_viewset.py
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.tenants.test.test_utils import BaseTenantTestCase
from apps.prescriptions.models import PrescriptionRecord
from apps.crm.models import Customer
from django.contrib.auth import get_user_model
from apps.users.models import Role
from apps.tenants.models import Client, SubscriptionPlan

User = get_user_model()

class PrescriptionViewSetTests(BaseTenantTestCase):
    def setUp(self):
        super().setUp()
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Customers tied to created_by
        self.customer1 = Customer.objects.create(
            first_name="John", last_name="Doe", email="john@example.com", phone="123",
            created_by=self.user,
            identification_number="1111111111",
        )
        self.customer2 = Customer.objects.create(
            first_name="Jane", last_name="Smith", email="jane@example.com", phone="456",
            created_by=self.user,
            identification_number="2222222222",
        )

        # Create prescriptions
        PrescriptionRecord.objects.create(customer=self.customer1, created_by=self.user)
        PrescriptionRecord.objects.create(customer=self.customer2, created_by=self.user)


        self.url_list = reverse('prescription-list')  # تأكد من اسم الـ router
        self.url_filter_options = reverse('prescription-filter-options')  # @action name

    def test_list_filter_by_customer_id(self):
        response = self.client.get(self.url_list, {"customer__id": self.customer1.id})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['customer'], self.customer1.id)

    def test_list_filter_by_customer_email(self):
        response = self.client.get(self.url_list, {"customer__email__icontains": "jane@example.com"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['customer'], self.customer2.id)

    def test_filter_options(self):
        response = self.client.get(self.url_filter_options)
        self.assertEqual(response.status_code, 200)
        options_dict = {item["name"]: item["values"] for item in response.data}
        self.assertIn("customer__id", options_dict)
        self.assertIn(self.customer1.id, options_dict["customer__id"])
        self.assertIn(self.customer2.id, options_dict["customer__id"])
        self.assertIn("customer__first_name", options_dict)
        self.assertIn("John", options_dict["customer__first_name"])
        self.assertIn("Jane", options_dict["customer__first_name"])



# python manage.py test prescriptions.tests.test_prescription_viewset.PrescriptionViewSetTests


# python manage.py test prescriptions.tests.test_prescription_viewset.PrescriptionViewSetTests
# python manage.py test prescriptions.tests.PrescriptionViewSetTests
