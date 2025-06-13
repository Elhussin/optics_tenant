from django.test import TestCase
from .models import Customer,Interaction,Complaint,Opportunity,Task,Campaign,Document,Subscription
from django.contrib.auth import get_user_model
User = get_user_model()

class CustomerModelTest(TestCase):
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
            interaction_type="call",
            notes="Test interaction notes"
        )
        self.assertEqual(str(interaction), "Call with John Doe")
        