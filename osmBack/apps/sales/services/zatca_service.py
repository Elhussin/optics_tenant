import base64
import hashlib
from decimal import Decimal
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class ZATCAService:
    @staticmethod
    def generate_zatca_qr_code(seller_name, vat_number, timestamp, total_amount, vat_amount):
        """
        Generates Phase 1 QR Code using TLV (Tag-Length-Value) Base64 encoding.
        """
        def to_tlv(tag, value):
            value_bytes = str(value).encode('utf-8')
            return bytes([tag, len(value_bytes)]) + value_bytes

        tlv_bytes = (
            to_tlv(1, seller_name) +
            to_tlv(2, vat_number) +
            to_tlv(3, timestamp) +
            to_tlv(4, total_amount) +
            to_tlv(5, vat_amount)
        )
        return base64.b64encode(tlv_bytes).decode('utf-8')

    @staticmethod
    def generate_ubl_xml(invoice):
        """
        Generates a valid UBL 2.1 XML structure representing the invoice metadata and lines.
        """
        seller_name = invoice.branch.name if invoice.branch else "Hussam Optical"
        vat_number = getattr(invoice.branch, 'vat_number', '300000000000003') or '300000000000003'
        timestamp = invoice.created_at.strftime('%Y-%m-%dT%H:%M:%SZ') if invoice.created_at else timezone.now().strftime('%Y-%m-%dT%H:%M:%SZ')
        total_amount = str(invoice.total_amount)
        vat_amount = str(invoice.tax_amount)

        # Generate base64 QR Code
        qr_code = ZATCAService.generate_zatca_qr_code(
            seller_name=seller_name,
            vat_number=vat_number,
            timestamp=timestamp,
            total_amount=total_amount,
            vat_amount=vat_amount
        )

        xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
    <cbc:UUID>{invoice.invoice_uuid}</cbc:UUID>
    <cbc:ID>{invoice.invoice_number}</cbc:ID>
    <cbc:IssueDate>{timestamp[:10]}</cbc:IssueDate>
    <cbc:IssueTime>{timestamp[11:19]}</cbc:IssueTime>
    <cac:AccountingSupplierParty>
        <cac:Party>
            <cac:PartyName>
                <cbc:Name>{seller_name}</cbc:Name>
            </cac:PartyName>
            <cac:PartyTaxScheme>
                <cbc:CompanyID>{vat_number}</cbc:CompanyID>
            </cac:PartyTaxScheme>
        </cac:Party>
    </cac:AccountingSupplierParty>
    <cac:TaxTotal>
        <cbc:TaxAmount currencyID="{invoice.currency}">{vat_amount}</cbc:TaxAmount>
    </cac:TaxTotal>
    <cac:LegalMonetaryTotal>
        <cbc:LineExtensionAmount currencyID="{invoice.currency}">{invoice.subtotal}</cbc:LineExtensionAmount>
        <cbc:TaxExclusiveAmount currencyID="{invoice.currency}">{invoice.subtotal}</cbc:TaxExclusiveAmount>
        <cbc:TaxInclusiveAmount currencyID="{invoice.currency}">{total_amount}</cbc:TaxInclusiveAmount>
        <cbc:PayableAmount currencyID="{invoice.currency}">{total_amount}</cbc:PayableAmount>
    </cac:LegalMonetaryTotal>
    <cac:AdditionalDocumentReference>
        <cbc:ID>QR</cbc:ID>
        <cbc:Attachment>
            <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">{qr_code}</cbc:EmbeddedDocumentBinaryObject>
        </cbc:Attachment>
    </cac:AdditionalDocumentReference>
</Invoice>"""
        return xml

    @staticmethod
    def calculate_invoice_hash(xml_data, previous_hash=None):
        """
        Computes SHA-256 hash of the current XML data combined with the previous hash.
        """
        sha256 = hashlib.sha256()
        sha256.update(xml_data.encode('utf-8'))
        if previous_hash:
            sha256.update(previous_hash.encode('utf-8'))
        return sha256.hexdigest()

    @staticmethod
    def submit_to_zatca(xml_data, invoice):
        """
        Simulates ZATCA API submission. In a real integration, this sends
        the signed XML via POST to ZATCA endpoint and parses response.
        """
        # Simulation: assume all inputs are valid.
        # Return a dictionary mimicking ZATCA API response.
        is_b2c = invoice.invoice_type_code in ['sale', 'return_sale'] # B2C
        
        # If invoice is marked as B2B, it must go through clearance, B2C goes through reporting
        status = 'REPORTED' if is_b2c else 'CLEARED'
        
        return {
            'status': status,
            'uuid': invoice.invoice_uuid,
            'invoice_number': invoice.invoice_number,
            'timestamp': timezone.now().isoformat(),
            'validation_results': {
                'info_messages': [],
                'warning_messages': [],
                'error_messages': []
            }
        }
