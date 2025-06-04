
# django settings
import os
from pathlib import Path
from decouple import config
BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-d(ha9ou$)!6d8)vqzc0c87)s*sju@k%odcjayt!l%&tyj_p%a3'

DEBUG = True

ALLOWED_HOSTS = ['*']  # during development only

# ===============================
# Database PostgreSQL
# ===============================
DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',  # هام جداً   
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

DATABASE_ROUTERS = (
    'django_tenants.routers.TenantSyncRouter',
)

# ===============================
# SHARED_APPS
# ===============================
SHARED_APPS = (
    'django_tenants',               # يجب أن يكون أولاً
    'tenants',                   # 

    # Django apps للعمل العام
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.admin',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_yasg',                          

    # Any shared apps between tenants, or general management
)

# ===============================
# TENANT_APPS
# ===============================
TENANT_APPS = (
    # Django apps
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.admin',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # التطبيقات الخاصة بالعميل فقط
    'users',
    'core',
    'orders',
    'accounts',
    'prescriptions',
    'products',
    'sales',
)
# ===============================
# merge apps
# ===============================
INSTALLED_APPS = list(SHARED_APPS) + [app for app in TENANT_APPS if app not in SHARED_APPS]


# ===============================
# Middleware
# ===============================
MIDDLEWARE = [
    'django_tenants.middleware.main.TenantMainMiddleware',  # يجب أن يأتي أولاً
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ===============================
# TEMPLATES
# ===============================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# AUTH_PASSWORD_VALIDATORS = [
#     {
#         'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
#     },
#     {
#         'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
#     },
# ]
WSGI_APPLICATION = 'optics_tenant.wsgi.application'

# ===============================
# URLs
# ===============================
ROOT_URLCONF = "optics_tenant.urls"  # Main urls.py for main requests
PUBLIC_SCHEMA_URLCONF = "optics_tenant.urls"  # Main urls.py for public schema
TENANT_MODEL = "tenants.Client" # Tenant model
TENANT_DOMAIN_MODEL = "tenants.Domain" # Tenant domain model
# ===============================
# Static Files
# ===============================
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ===============================
# Other Settings
# ===============================
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ===============================
# Email Settings
# ===============================
TENANT_BASE_DOMAIN = config('TENANT_BASE_DOMAIN')
PORT = config('PORT', default=8000)
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST')
EMAIL_PORT = config('EMAIL_PORT')
EMAIL_USE_SSL = True
EMAIL_USE_TLS = False
EMAIL_HOST_USER = config('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
