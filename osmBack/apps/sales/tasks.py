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
            from django.db import transaction

            with transaction.atomic():
                invoice = Invoice.objects.select_for_update().select_related('branch', 'customer', 'partner').get(pk=invoice_id)
                
                # 1. Retrieve previous invoice hash (if any) with lock protection
                previous_hash = None
                query = Invoice.objects.filter(branch=invoice.branch).exclude(pk=invoice.pk)
                if invoice.confirmed_at:
                    query = query.filter(confirmed_at__lte=invoice.confirmed_at)
                last_invoice = query.order_by('-created_at').first()
                
                if last_invoice and last_invoice.current_invoice_hash:
                    previous_hash = last_invoice.current_invoice_hash
                
                invoice.previous_invoice_hash = previous_hash
                
                # 2. Generate UBL XML with previous hash
                xml_data = ZATCAService.generate_ubl_xml(invoice, previous_hash=previous_hash)
                
                # 3. Calculate current invoice hash
                invoice.current_invoice_hash = ZATCAService.calculate_invoice_hash(xml_data, previous_hash)
                invoice.save(update_fields=['previous_invoice_hash', 'current_invoice_hash'])
            
            # 4. Submit to ZATCA API (Clearance / Reporting)
            response = ZATCAService.submit_to_zatca(xml_data, invoice)
            
            # 5. Update invoice status based on ZATCA response
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

@shared_task(bind=True)
def async_generate_financial_report(self, schema_name, branch_id, start_date, end_date, email):
    """
    Asynchronously generates a financial report (PDF) and emails it.
    """
    import os
    import tempfile
    from django.core.mail import EmailMessage
    from weasyprint import HTML
    from django.template.loader import render_to_string
    from apps.sales.services.report_service import SalesReportService

    logger.info(f"Starting async financial report generation for schema {schema_name}, email {email}")

    with schema_context(schema_name):
        try:
            # 1. Fetch Heavy Data
            data = SalesReportService.get_financial_dashboard(branch_id, start_date, end_date)
            
            # 2. Render HTML template
            # Assumes a template exists at 'sales/reports/financial_report_pdf.html'
            # For this scaffolding, we will provide a minimal inline HTML if it doesn't exist.
            html_content = f"""
            <html>
                <head><title>Financial Report</title></head>
                <body>
                    <h1>Financial Report</h1>
                    <p>Total Revenue: {data['total_revenue']}</p>
                    <p>Net Revenue: {data['net_revenue']}</p>
                    <p>Total Taxes: {data['total_taxes']}</p>
                    <p>Total Discounts: {data['total_discounts']}</p>
                </body>
            </html>
            """
            
            # 3. Generate PDF via WeasyPrint
            pdf_file = HTML(string=html_content).write_pdf()
            
            # 4. Email the PDF
            email_msg = EmailMessage(
                subject="Your Financial Report is Ready",
                body="Please find attached your requested financial report.",
                from_email=None,  # Uses DEFAULT_FROM_EMAIL
                to=[email],
            )
            email_msg.attach('financial_report.pdf', pdf_file, 'application/pdf')
            email_msg.send()
            
            logger.info(f"Successfully generated and emailed financial report to {email}")
            
        except Exception as exc:
            logger.error(f"Failed to generate financial report for {email}: {str(exc)}")
            raise self.retry(exc=exc)
