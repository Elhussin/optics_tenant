# from django.core.management.base import BaseCommand
# from django_tenants.utils import get_tenant_model, get_tenant_domain_model

# class Command(BaseCommand):
#     help = "Create the public tenant and assign a domain (usually 127.0.0.1 for dev)"

#     def handle(self, *args, **kwargs):
#         TenantModel = get_tenant_model()
#         DomainModel = get_tenant_domain_model()

#         tenant, created = TenantModel.objects.get_or_create(
#             schema_name='public',
#             defaults={
#                 'name': 'Main Site',
#                 'paid_until': '2030-12-31',
#                 'on_trial': False
#             }
#         )

#         if created:
#             self.stdout.write(self.style.SUCCESS('✅ Public tenant created.'))
#         else:
#             self.stdout.write(self.style.WARNING('⚠️ Public tenant already exists.'))

#         domain, domain_created = DomainModel.objects.get_or_create(
#             domain='127.0.0.1',
#             tenant=tenant,
#             is_primary=True
#         )

#         if domain_created:
#             self.stdout.write(self.style.SUCCESS('✅ Domain 127.0.0.1 added to public tenant.'))
#         else:
#             self.stdout.write(self.style.WARNING('⚠️ Domain 127.0.0.1 already exists.'))


from django.core.management.base import BaseCommand
from django_tenants.utils import get_tenant_model, get_tenant_domain_model
import datetime

class Command(BaseCommand):
    help = "Create the public tenant with custom data"

    def add_arguments(self, parser):
        parser.add_argument('--domain', type=str, default='127.0.0.1', help='Domain name for the public tenant')
        parser.add_argument('--name', type=str, default='Main Site', help='Name of the tenant')
        parser.add_argument('--paid_until', type=str, default='2030-12-31', help='Paid until date in YYYY-MM-DD')
        parser.add_argument('--trial', action='store_true', help='Set tenant as on trial')

    def handle(self, *args, **options):
        TenantModel = get_tenant_model()
        DomainModel = get_tenant_domain_model()

        # Parse options
        domain = options['domain']
        name = options['name']
        paid_until = options['paid_until']
        on_trial = options['trial']

        tenant, created = TenantModel.objects.get_or_create(
            schema_name='public',
            defaults={
                'name': name,
                'paid_until': paid_until,
                'on_trial': on_trial
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Public tenant created: {name}'))
        else:
            self.stdout.write(self.style.WARNING('⚠️ Public tenant already exists.'))

        domain_obj, domain_created = DomainModel.objects.get_or_create(
            domain=domain,
            tenant=tenant,
            is_primary=True
        )

        if domain_created:
            self.stdout.write(self.style.SUCCESS(f'✅ Domain {domain} assigned to tenant.'))
        else:
            self.stdout.write(self.style.WARNING(f'⚠️ Domain {domain} already exists.'))
# استخدام القيم الافتراضية
# python manage.py create_public_tenant

# تمرير بيانات مخصصة
# python manage.py create_public_tenant --domain=localhost --name="Solo Vizion" --paid_until=2032-01-01 --trial
