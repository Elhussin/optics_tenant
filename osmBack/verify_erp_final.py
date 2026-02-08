import os
import django
import sys
from decimal import Decimal

# 1. SETUP DJANGO
print("Setting up Django...")
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "optics_tenant.settings")
django.setup()
print("Django setup complete.")

# 2. IMPORT APPS AFTER SETUP
try:
    from django_tenants.utils import schema_context
    from apps.tenants.models import Client
    from apps.branches.models import Branch, BranchUsers
    from django.contrib.auth import get_user_model
    from apps.products.models import Product, ProductVariant, PricingPolicy
    from apps.sales.models import Invoice, InvoiceType, InvoiceItem, PaymentMethod
    from apps.accounting.models.chart_of_accounts import ChartOfAccounts, GeneralJournal, JournalLine
    from apps.sales.services.invoice_service import confirm_invoice
    from apps.sales.services.payment_service import register_payment
    from apps.hrm.models import Employee
    from apps.crm.models import Customer
    print("Apps imported successfully.")
except Exception as e:
    print(f"Error importing apps: {e}")
    sys.exit(1)

User = get_user_model()


def setup_test_data():
    print("Setting up test data...")
    user = User.objects.first()
    branch = Branch.objects.first()

    if not user:
        print("CRITICAL: No user found.")
        return None
    if not branch:
        print("CRITICAL: No branch found.")
        # Try to create one if allowed? No, depend on existing data for now.
        return None

    # Create Branch User
    employee, _ = Employee.objects.get_or_create(
        user=user,
        defaults={"phone": "1234567890", "salary": 5000}
    )

    branch_user, _ = BranchUsers.objects.get_or_create(
        branch=branch,
        employee=employee,
        defaults={"is_active": True}
    )

    # Create Customer
    customer, _ = Customer.objects.get_or_create(
        first_name="Test",
        last_name="Customer",
        defaults={"phone": "123456789", "created_by": user}
    )

    # 1. Accounts
    revenue_account = ChartOfAccounts.get_by_subtype(
        'sales') or ChartOfAccounts.get_by_code('4100')
    ar_account = ChartOfAccounts.get_by_subtype(
        'receivable') or ChartOfAccounts.get_by_code('1200')
    bank_account = ChartOfAccounts.get_by_subtype(
        'bank') or ChartOfAccounts.get_by_code('1100')

    if not revenue_account or not ar_account or not bank_account:
        print("Creating default accounts...")
        # Create minimal chart of accounts
        assets, _ = ChartOfAccounts.objects.get_or_create(
            code="1000", defaults={"name": "Assets", "account_type": "asset", "is_header": True}
        )
        liabilities, _ = ChartOfAccounts.objects.get_or_create(
            code="2000", defaults={"name": "Liabilities", "account_type": "liability", "is_header": True}
        )
        equity, _ = ChartOfAccounts.objects.get_or_create(
            code="3000", defaults={"name": "Equity", "account_type": "equity", "is_header": True}
        )
        income, _ = ChartOfAccounts.objects.get_or_create(
            code="4000", defaults={"name": "Revenue", "account_type": "revenue", "is_header": True}
        )
        expenses, _ = ChartOfAccounts.objects.get_or_create(
            code="5000", defaults={"name": "Expenses", "account_type": "expense", "is_header": True}
        )

        # Leaf Accounts
        bank_account, _ = ChartOfAccounts.objects.get_or_create(
            code="1100",
            defaults={"name": "Bank", "account_type": "asset",
                      "account_subtype": "bank", "parent": assets}
        )
        ar_account, _ = ChartOfAccounts.objects.get_or_create(
            code="1200",
            defaults={"name": "Accounts Receivable", "account_type": "asset",
                      "account_subtype": "receivable", "parent": assets}
        )
        revenue_account, _ = ChartOfAccounts.objects.get_or_create(
            code="4100",
            defaults={"name": "Sales Revenue", "account_type": "revenue",
                      "account_subtype": "sales", "parent": income}
        )
        print("Accounts created.")

    if not revenue_account or not ar_account or not bank_account:
        print(
            f"Error: Missing accounts after creation check. Rev: {revenue_account}, AR: {ar_account}, Bank: {bank_account}")
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
        'branch_user': branch_user,
        'branch': branch,
        'customer': customer,
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
        customer=data['customer'],
        created_by=data['branch_user'],
        status='draft',
        currency='SAR'
    )

    item = InvoiceItem.objects.create(
        invoice=invoice,
        product_variant=data['variant'],
        quantity=1,
        unit_price=100
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

    payment = register_payment(
        invoice=invoice,
        amount=50,
        payment_method=data['pay_method'],
        user=data['branch_user'],
    )
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
        # Find a suitable tenant
        tenant = Client.objects.exclude(schema_name='public').first()
        if not tenant:
            print("CRITICAL: No tenant found (excluding public).")
            # If only public exists and we are testing on public?
            # But Branch is tenant specific.
            # Try getting 'store1' specifically if implicit finding fails?
            tenant = Client.objects.filter(schema_name='store1').first()

        if not tenant:
            print("CRITICAL: Could not find a tenant to run tests against.")
            sys.exit(1)

        print(f"Running verification using tenant: {tenant.schema_name}")

        with schema_context(tenant.schema_name):
            data = setup_test_data()
            if data:
                invoice = verify_invoice_flow(data)
                if invoice:
                    verify_payment_flow(data, invoice)
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
