from celery import shared_task
from django_tenants.utils import schema_context
from apps.tenants.models import Client
from apps.sales.models import Invoice
from apps.sales.services.zatca_service import ZATCAService
import logging

logger = logging.getLogger('tenant')

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def submit_invoice_to_zatca_task(self, schema_name, invoice_id):
    """
    Asynchronously generates UBL XML, computes cryptographic hash chains,
    and submits the invoice to the ZATCA API.
    """
    logger.info(f"Starting ZATCA submission for invoice ID {invoice_id} in schema {schema_name}")
    
    with schema_context(schema_name):
        try:
            invoice = Invoice.objects.select_related('branch').get(pk=invoice_id)
            
            # 1. Generate UBL XML
            xml_data = ZATCAService.generate_ubl_xml(invoice)
            
            # 2. Retrieve previous invoice hash (if any)
            previous_hash = None
            last_invoice = Invoice.objects.filter(
                branch=invoice.branch,
                confirmed_at__lt=invoice.confirmed_at
            ).exclude(pk=invoice.pk).order_by('-confirmed_at').first()
            
            if last_invoice and last_invoice.current_invoice_hash:
                previous_hash = last_invoice.current_invoice_hash
            
            invoice.previous_invoice_hash = previous_hash
            
            # 3. Calculate current invoice hash
            invoice.current_invoice_hash = ZATCAService.calculate_invoice_hash(xml_data, previous_hash)
            invoice.save(update_fields=['previous_invoice_hash', 'current_invoice_hash'])
            
            # 4. Submit to ZATCA API
            response = ZATCAService.submit_to_zatca(xml_data, invoice)
            
            # 5. Update invoice status based on response
            if response['status'] == 'CLEARED':
                invoice.status = 'cleared'
            elif response['status'] == 'REPORTED':
                invoice.status = 'reported'
            else:
                invoice.status = 'rejected'
                
            invoice.save(update_fields=['status'])
            logger.info(f"Successfully processed ZATCA submission for invoice {invoice.invoice_number} (status: {invoice.status})")
            
        except Invoice.DoesNotExist:
            logger.error(f"Invoice with ID {invoice_id} not found in schema {schema_name}")
        except Exception as exc:
            logger.error(f"Error during ZATCA submission for invoice ID {invoice_id}: {str(exc)}")
            raise self.retry(exc=exc)
