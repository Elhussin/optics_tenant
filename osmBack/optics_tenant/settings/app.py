# ===============================
# SHARED_APPS
# ===============================
SHARED_APPS = (
    'django_tenants',
    'apps.users',
    'core',
    'apps.tenants',
    'admin_interface',
    'colorfield',
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.admin',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework.authtoken',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'simple_history',
    'corsheaders', # for 
    'djmoney',
    'drf_spectacular',
    'drf_spectacular_sidecar',
    'django_extensions',
    # Wagtail CMS
    # 'modelcluster',
    # 'taggit',
    # 'wagtail.contrib.forms',
    # 'wagtail.contrib.redirects',
    # 'wagtail.embeds',
    # 'wagtail.sites',
    # 'wagtail.users',
    # 'wagtail.snippets',
    # 'wagtail.documents',
    # 'wagtail.images',
    # 'wagtail.search',
    # 'wagtail.admin',
    # 'wagtail',
    # 'wagtail.api.v2',
    # 'wagtail_localize',
    # 'cms',  # app for wagtail

)

# ===============================
# TENANT_APPS
# ===============================
TENANT_APPS = (
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.admin',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django_extensions',
    'core',
    'apps.users',
    'apps.prescriptions',
    'apps.products',
    'apps.crm',
    'apps.hrm',
    'apps.branches',
    'apps.accounting',
    'apps.sales',
)