from apps.sales.services.payment_service import register_payment
from apps.sales.services.invoice_service import confirm_invoice
from apps.accounting.models.chart_of_accounts import ChartOfAccounts, GeneralJournal, JournalLine
from apps.sales.models import Invoice, InvoiceType, InvoiceItem, PaymentMethod
from apps.products.models import Product, ProductVariant, PricingPolicy
from django.contrib.auth import get_user_model
from apps.branches.models import Branch
import os
import django
from decimal import Decimal

# 1. SETUP DJANGO
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "optics_tenant.settings")
django.setup()

# 2. IMPORT APPS AFTER SETUP

User = get_user_model()


def setup_test_data():
    print("Setting up test data...")
    user = User.objects.first()
    branch = Branch.objects.first()

    # 1. Accounts
    revenue_account = ChartOfAccounts.get_by_subtype(
        'sales') or ChartOfAccounts.get_by_code('4100')
    ar_account = ChartOfAccounts.get_by_subtype(
        'receivable') or ChartOfAccounts.get_by_code('1200')
    bank_account = ChartOfAccounts.get_by_subtype(
        'bank') or ChartOfAccounts.get_by_code('1100')

    if not revenue_account or not ar_account or not bank_account:
        print(
            f"Error: Missing accounts. Rev: {revenue_account}, AR: {ar_account}, Bank: {bank_account}")

        # Fallback for testing environment if accounts don't exist
        print("Attempting to find ANY account for testing...")
        asset = ChartOfAccounts.objects.filter(account_type='asset').first()
        liability = ChartOfAccounts.objects.filter(
            account_type='liability').first()
        revenue = ChartOfAccounts.objects.filter(
            account_type='revenue').first()

        revenue_account = revenue
        ar_account = asset
        bank_account = asset

        if not revenue_account or not ar_account:
            print("CRITICAL: No accounts found in DB.")
            return None

    # 2. Pricing Policy
    policy, _ = PricingPolicy.objects.get_or_create(name="Standard Policy")

    # 3. Invoice Type
    inv_type, _ = InvoiceType.objects.get_or_create(
        code="SALE",
        defaults={
            "name": "Standard Sale",
            "pricing_policy": policy,
            "revenue_account": revenue_account
        }
    )

    # 4. Product
    product = Product.objects.first()
    if not product:
        print("CRITICAL: No products found.")
        return None

    variant = ProductVariant.objects.filter(product=product).first()

    # 5. Payment Method
    pay_method, _ = PaymentMethod.objects.get_or_create(
        code="CASH",
        defaults={"name_en": "Cash", "name_ar": "Cash",
                  "gl_account": bank_account}
    )

    return {
        'user': user,
        'branch': branch,
        'inv_type': inv_type,
        'variant': variant,
        'pay_method': pay_method,
        'revenue_account': revenue_account,
        'ar_account': ar_account,
        'bank_account': bank_account
    }


def verify_invoice_flow(data):
    print("\n--- Verifying Invoice Flow ---")

    # 1. Create Invoice
    invoice = Invoice.objects.create(
        invoice_type=data['inv_type'],
        branch=data['branch'],
        created_by=data['user'],
        status='draft',
        currency='SAR'
    )

    item = InvoiceItem.objects.create(
        invoice=invoice,
        product_variant=data['variant'],
        quantity=1,
        unit_price=100,
        tax_amount=15,
        total_price=115
    )

    invoice.calculate_totals()
    print(
        f"Draft Invoice created: {invoice.invoice_number}, Total: {invoice.total_amount}")

    # 2. Confirm Invoice
    confirm_invoice(invoice)
    invoice.refresh_from_db()

    if invoice.status != 'confirmed':
        print(f"FAIL: Invoice status not confirmed, got {invoice.status}")
        return False

    print("Invoice confirmed.")

    # 3. Check GL Entry
    journal = GeneralJournal.objects.filter(
        source_type='sales_invoice', source_id=invoice.id).first()
    if not journal:
        print("FAIL: No Journal Entry created for invoice")
        return False

    print(f"Journal Entry created: {journal.entry_number}")
    for line in journal.lines.all():
        print(f"  - {line.account.name}: Dr {line.debit} | Cr {line.credit}")

    # Check consistency
    total_dr = sum(l.debit for l in journal.lines.all())
    total_cr = sum(l.credit for l in journal.lines.all())

    if total_dr != total_cr:
        print(f"FAIL: Journal unbalanced Dr {total_dr} != Cr {total_cr}")
        return False

    return invoice


def verify_payment_flow(data, invoice):
    print("\n--- Verifying Payment Flow ---")

    amount = 50
    payment = register_payment(
        invoice, amount, data['pay_method'], user=data['user'])

    print(f"Payment registered: {payment.id}, Amount: {payment.amount}")

    # Check Invoice Status
    invoice.refresh_from_db()
    if invoice.status != 'partially_paid':
        print(
            f"FAIL: Invoice status expected 'partially_paid', got {invoice.status}")
        return False

    print(f"Invoice Status: {invoice.status}, Paid: {invoice.paid_amount}")

    # Check GL Entry
    journal = GeneralJournal.objects.filter(
        source_type='payment', source_id=payment.id).first()
    if not journal:
        print("FAIL: No Journal Entry created for payment")
        return False

    print(f"Journal Entry created: {journal.entry_number}")
    for line in journal.lines.all():
        print(f"  - {line.account.name}: Dr {line.debit} | Cr {line.credit}")

    return True


if __name__ == "__main__":
    try:
        data = setup_test_data()
        if data:
            invoice = verify_invoice_flow(data)
            if invoice:
                verify_payment_flow(data, invoice)
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
