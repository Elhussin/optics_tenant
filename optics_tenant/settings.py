import os
from pathlib import Path
from datetime import timedelta
from .config_loader import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config("SECRET_KEY")
DEBUG = config("DEBUG", default=False, cast=bool)
ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="localhost").split(",")
FRONTEND_URL =config("FRONTEND_URL")
# ===============================
# Database PostgreSQL
# ===============================
DATABASES = {
    'default': {
        'ENGINE': 'django_tenants.postgresql_backend',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

DATABASE_ROUTERS = ('django_tenants.routers.TenantSyncRouter',)

# ===============================
# SHARED_APPS
# ===============================
SHARED_APPS = (
    'django_tenants',
    'core',
    'users',
    'tenants',
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
    'corsheaders',
    'djmoney',
    'drf_spectacular',
    'drf_spectacular_sidecar',
    'django_extensions',
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
    'users',
    'prescriptions',
    'products',
    'CRM',
    'HRM',
    'branches',
    'accounting',
    'sales',
)

AUTH_USER_MODEL = 'users.User'

# ===============================
# merge apps
# ===============================
INSTALLED_APPS = list(SHARED_APPS) + [app for app in TENANT_APPS if app not in SHARED_APPS]

X_FRAME_OPTIONS = 'SAMEORIGIN'

# ===============================
# Middleware
# ===============================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    'core.middleware.TenantMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'simple_history.middleware.HistoryRequestMiddleware',
]

# ===============================
# Templates
# ===============================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'

SITE_ID = 1

REST_USE_JWT = True

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'core.middleware.CookieJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

CORS_ALLOW_CREDENTIALS = config("CORS_ALLOW_CREDENTIALS", default=True, cast=bool)
CORS_ALLOW_ALL_ORIGINS = config("CORS_ALLOW_ALL_ORIGINS", default=True, cast=bool)
CORS_ALLOW_HEADERS = config("CORS_ALLOW_HEADERS", default="accept,accept-encoding,authorization,content-type,dnt,origin,user-agent,x-csrftoken,x-requested-with").split(',')
CORS_ALLOW_METHODS = config("CORS_ALLOW_METHODS", default="DELETE,GET,OPTIONS,PATCH,POST,PUT").split(',')
CORS_ALLOWED_ORIGIN_REGEXES = config("CORS_ALLOWED_ORIGIN_REGEXES", default=r"^http://localhost:3000$,^http://.+\.localhost:3000$", cast=lambda v: v.split(","))

WSGI_APPLICATION = 'optics_tenant.wsgi.application'
ROOT_URLCONF = 'optics_tenant.urls'
PUBLIC_SCHEMA_URLCONF = 'optics_tenant.public_urls'
TENANT_MODEL = 'tenants.Client'
TENANT_DOMAIN_MODEL = 'tenants.Domain'

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Riyadh'
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

TENANT_BASE_DOMAIN = config('TENANT_BASE_DOMAIN')
PORT = config('PORT', default=8000, cast=int)

if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')
    EMAIL_HOST = config('EMAIL_HOST')
    EMAIL_PORT = config('EMAIL_PORT', cast=int)
    EMAIL_USE_SSL = config('EMAIL_USE_SSL', default=True, cast=bool)
    EMAIL_USE_TLS = config('EMAIL_USE_TLS', default=False, cast=bool)
    EMAIL_HOST_USER = config('EMAIL_HOST_USER')
    EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
    DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

SPECTACULAR_SETTINGS = {
    'TITLE': 'API Documentation',
    'DESCRIPTION': 'API for optics Management System',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/',
}



CSRF_COOKIE_NAME = 'optics_tenant_csrftoken'
CSRF_HEADER_NAME = 'HTTP_X_OPTICS_TENANT_CSRFTOKEN'
SESSION_COOKIE_NAME = 'optics_tenant_sessionid'
CSRF_COOKIE_HTTPONLY = False

if DEBUG:
    SESSION_COOKIE_SECURE = False # required https 
    CSRF_COOKIE_SECURE = False  # required https
    SECURE_HSTS_SECONDS = 0 # required https
    SECURE_HSTS_INCLUDE_SUBDOMAINS = False # required https
    SECURE_CONTENT_TYPE_NOSNIFF = False  
    SECURE_PROXY_SSL_HEADER = None # required https 
else:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


ACCESS_TOKEN_LIFETIME_MINUTES = config("ACCESS_TOKEN_LIFETIME_MINUTES", cast=int, default=15)
REFRESH_TOKEN_LIFETIME_DAYS = config("REFRESH_TOKEN_LIFETIME_DAYS", cast=int, default=7)
AUTH_COOKIE_SECURE = config("AUTH_COOKIE_SECURE", default=False, cast=bool)

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=ACCESS_TOKEN_LIFETIME_MINUTES),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=REFRESH_TOKEN_LIFETIME_DAYS),
    'UPDATE_LAST_LOGIN': True,
    'AUTH_HEADER_TYPES': ("Bearer",),
    'AUTH_COOKIE': "access_token",
    'AUTH_COOKIE_REFRESH': "refresh_token",
    'AUTH_COOKIE_SECURE': AUTH_COOKIE_SECURE,
    'AUTH_COOKIE_HTTP_ONLY': True,
    'AUTH_COOKIE_SAMESITE': "Lax",
    "ALGORITHM": "HS256",
    "SIGNING_KEY":config("JWT_SECRET")
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

REST_AUTH_SERIALIZERS = {
    'LOGIN_SERIALIZER': 'dj_rest_auth.serializers.LoginSerializer',
}
