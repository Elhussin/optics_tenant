from decimal import Decimal
from django.utils import timezone
from apps.tenants.test.test_utils import BaseTenantTestCase
from apps.sales.models import Invoice, InvoiceType, Order
from apps.sales.services.zatca_service import ZATCAService
from apps.sales.tasks import submit_invoice_to_zatca_task
from apps.crm.models import Customer


class ZATCAServiceTest(BaseTenantTestCase):
    def setUp(self):
        super().setUp()
        self.invoice_type = InvoiceType.objects.create(
            name="Sale Invoice",
            code="sale_inv",
            action_type="sale"
        )
        self.customer = Customer.objects.create(
            first_name="Ahmed",
            last_name="Ali",
            email="ahmed@example.com",
            phone="1234567890",
            identification_number="1098765432"
        )
        self.invoice = Invoice.objects.create(
            branch=self.branch,
            customer=self.customer,
            invoice_type=self.invoice_type,
            subtotal=Decimal('100.00'),
            tax_rate=Decimal('0.15'),
            tax_amount=Decimal('15.00'),
            total_amount=Decimal('115.00'),
            status='confirmed',
            confirmed_at=timezone.now()
        )

    def test_generate_zatca_qr_code_5_tags(self):
        qr_code = ZATCAService.generate_zatca_qr_code(
            seller_name="Optics Shop",
            vat_number="300000000000003",
            timestamp="2026-08-02T12:00:00Z",
            total_amount="115.00",
            vat_amount="15.00"
        )
        self.assertIsNotNone(qr_code)
        self.assertTrue(len(qr_code) > 20)

    def test_generate_zatca_qr_code_9_tags(self):
        qr_code = ZATCAService.generate_zatca_qr_code(
            seller_name="Optics Shop",
            vat_number="300000000000003",
            timestamp="2026-08-02T12:00:00Z",
            total_amount="115.00",
            vat_amount="15.00",
            xml_hash="hash123",
            ecdsa_signature="sig123",
            public_key="pubkey123",
            stamp_certificate="cert123"
        )
        self.assertIsNotNone(qr_code)
        self.assertTrue(len(qr_code) > 30)

    def test_generate_ubl_xml(self):
        xml = ZATCAService.generate_ubl_xml(self.invoice)
        self.assertIn("<?xml version=", xml)
        self.assertIn("<Invoice", xml)
        self.assertIn(str(self.invoice.invoice_uuid), xml)
        self.assertIn("115.00", xml)
        self.assertIn("15.00", xml)

    def test_calculate_invoice_hash(self):
        xml = ZATCAService.generate_ubl_xml(self.invoice)
        hash1 = ZATCAService.calculate_invoice_hash(xml)
        hash2 = ZATCAService.calculate_invoice_hash(xml, previous_hash=hash1)
        self.assertIsNotNone(hash1)
        self.assertIsNotNone(hash2)
        self.assertNotEqual(hash1, hash2)

    def test_submit_to_zatca_simulation(self):
        xml = ZATCAService.generate_ubl_xml(self.invoice)
        response = ZATCAService.submit_to_zatca(xml, self.invoice)
        self.assertIn(response['status'], ['CLEARED', 'REPORTED'])
        self.assertEqual(response['uuid'], str(self.invoice.invoice_uuid))

    def test_celery_zatca_task_execution(self):
        # Execute Celery task directly for the test tenant schema
        submit_invoice_to_zatca_task('public', self.invoice.id)
        self.invoice.refresh_from_db()
        self.assertIsNotNone(self.invoice.current_invoice_hash)
        self.assertIn(self.invoice.status, ['cleared', 'reported'])
