
from django_tenants.utils import get_tenant_model,get_tenant_domain_model

TenantModel = get_tenant_model()
DomainModel = get_tenant_domain_model()

# إنشاء التينانت الرئيسي (العام) لو مش موجود
tenant, created = TenantModel.objects.get_or_create(
    schema_name='public',
    defaults={
        'name': 'Main Site',
        'paid_until': '2030-12-31',
        'on_trial': False
    }
)

# ربط التينانت بالدومين 127.0.0.1
DomainModel.objects.get_or_create(
    domain='127.0.0.1',
    tenant=tenant,
    is_primary=True
)

if __name__ == "__main__":
    print("🔧 Creating tenant with superuser...")
    
    
# python manage.py shell