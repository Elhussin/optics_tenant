from apps.tenants.test.test_utils import BaseTenantTestCase
from .models.customer import Customer, Interaction, Complaint, Opportunity, Task, Campaign, Document, Subscription
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomerModelTest(BaseTenantTestCase):

    def _create_customer(self):
        return Customer.objects.create(
            created_by=self.user,
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
            is_vip=True,
            loyalty_points=100,
            accepts_marketing=True,
            registration_number="REG123456",
            tax_number="TAX123456",
            preferred_contact="email",
            website="https://example.com",
            logo=None,
            description="Test customer description"
        )

    def test_customer_str(self):
        customer = self._create_customer()
        self.assertEqual(str(customer), "John Doe")

    def test_interaction_str(self):
        customer = self._create_customer()
        interaction = Interaction.objects.create(
            customer=customer,
            interaction_type="call",
            notes="Test interaction notes"
        )
        self.assertEqual(str(interaction), "call with John Doe")

    def test_complaint_str(self):
        customer = self._create_customer()
        complaint = Complaint.objects.create(
            customer=customer,
            description="Test complaint description",
            status="open"
        )
        self.assertEqual(str(complaint), "Complaint by John Doe")

    def test_opportunity_str(self):
        customer = self._create_customer()
        opportunity = Opportunity.objects.create(
            customer=customer,
            title="Test opportunity title",
            stage="lead",
            amount=1000.00
        )
        self.assertEqual(str(opportunity), "Test opportunity title - lead")

    def test_task_str(self):
        customer = self._create_customer()
        opportunity = Opportunity.objects.create(
            customer=customer,
            title="Test opportunity title",
            stage="lead",
            amount=1000.00
        )
        task = Task.objects.create(
            customer=customer,
            opportunity=opportunity,
            title="Test task title",
            description="Test task description",
            priority="medium",
            completed=False
        )
        self.assertEqual(str(task), "Test task title")

    def test_campaign_str(self):
        customer = self._create_customer()
        campaign = Campaign.objects.create(
            name="Test campaign title",
            description="Test campaign description",
            start_date="2022-01-01",
            end_date="2022-01-31"
        )
        campaign.customers.add(customer)
        self.assertEqual(str(campaign), "Test campaign title")

    def test_document_str(self):
        customer = self._create_customer()
        document = Document.objects.create(
            customer=customer,
            title="Test document title",
            file="test_document.pdf"
        )
        self.assertEqual(str(document), "Test document title")
