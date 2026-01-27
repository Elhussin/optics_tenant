from apps.users.models import Role, Permission
from apps.sales.models import PaymentMethod
from django.utils.translation import gettext_lazy as _


def seed_tenant_data(stdout=None):
    """
    Seeds essential data for a tenant (Roles, Permissions, PaymentMethods).
    Should be called within the schema context.
    """
    if stdout:
        stdout.write("Seeding basic tenant data...")

    # 1. Seed Permissions (Basic set)
    # This usually comes from your apps, but we can ensure a few basics exist
    # Permission.objects.get_or_create(code='view_dashboard', defaults={'description': 'View Dashboard'})

    # 2. Seed Roles
    owner_role, created = Role.objects.get_or_create(
        name='TenantOwner',
        defaults={'description': 'System Owner with full access'}
    )
    if created and stdout:
        stdout.write(f"✅ Created 'owner' role.")

    # Assign all permissions to owner
    all_perms = Permission.objects.all()
    if all_perms.exists():
        owner_role.permissions.set(all_perms)
        if stdout:
            stdout.write(
                f"✅ Assigned {all_perms.count()} permissions to 'owner' role.")

    # 3. Seed Default Payment Methods
    try:
        payment_methods = [
            {'code': 'cash', 'name_ar': 'نقدي',
                'name_en': 'Cash', 'is_installment': False},
            {'code': 'mada', 'name_ar': 'مدى',
                'name_en': 'Mada', 'is_installment': False},
            {'code': 'visa', 'name_ar': 'فيزا',
                'name_en': 'Visa', 'is_installment': False},
            {'code': 'mastercard', 'name_ar': 'ماستر كارد',
                'name_en': 'Mastercard', 'is_installment': False},
            {'code': 'apple_pay', 'name_ar': 'Apple Pay',
                'name_en': 'Apple Pay', 'is_installment': False},
            {'code': 'stc_pay', 'name_ar': 'STC Pay',
                'name_en': 'STC Pay', 'is_installment': False},
            {'code': 'tabby', 'name_ar': 'تابي',
                'name_en': 'Tabby', 'is_installment': True},
            {'code': 'tamara', 'name_ar': 'تمارا',
                'name_en': 'Tamara', 'is_installment': True},
        ]

        for pm_data in payment_methods:
            pm, pm_created = PaymentMethod.objects.get_or_create(
                code=pm_data['code'],
                defaults={
                    'name_ar': pm_data['name_ar'],
                    'name_en': pm_data['name_en'],
                    'is_installment': pm_data['is_installment'],
                    'is_active': True
                }
            )
            if pm_created and stdout:
                stdout.write(f"✅ Created payment method: {pm_data['name_en']}")
    except Exception as e:
        if stdout:
            stdout.write(
                f"⚠️ Skipping payment methods seeding (Table might not exist in this schema).")

    return owner_role


# To setup the main site (Public)
# python manage.py setup_tenant --name "Main Site" --schema public --domain localhost --password "3112"


# pdm run python manage.py setup_tenant --name "Store Site" --schema store --domain store.localhost --password "3112"
