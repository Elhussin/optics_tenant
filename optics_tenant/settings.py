
# django settings
import os
from pathlib import Path
from decouple import config # for environment variables
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY','django-insecure-d(ha9ou$)!6d8)vqzc0c87)s*sju@k%odcjayt!l%&tyj_p%a3')
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*').split(',')

# CORS_ALLOWED_ORIGINS = config('CORS_ALLOWED_ORIGINS', default='*').split(',')

CORS_ALLOW_CREDENTIALS = config('CORS_ALLOW_CREDENTIALS', default=True, cast=bool)

CORS_ALLOW_HEADERS = config('CORS_ALLOW_HEADERS', default='*').split(',')

CORS_ALLOW_METHODS = config('CORS_ALLOW_METHODS', default='*').split(',')

# CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default='*').split(',')

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
    'admin_interface',
    'colorfield',
    # Django apps للعمل العام
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.admin',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    "django.contrib.sites",             # Multiple sites in one Django project
    'rest_framework',
    'rest_framework_simplejwt',
    "rest_framework_simplejwt.token_blacklist", # Token blacklist for logout 
    "rest_framework.authtoken",         # Token-based authentication
    'drf_yasg',                         # OpenAPI 3.0 schema generator for Django REST framework 
    'allauth',                          # User authentication & registration 
    'allauth.account',                  # User registration & email verification & password reset
    'allauth.socialaccount',            # Social authentication OAuth 2.0
    'dj_rest_auth',                     # Allowing to use Django REST Framework with allauth 
    'dj_rest_auth.registration',        # REST API endpoints for Django allauth registration
    'simple_history',                   # Store model history and view history changes
    'corsheaders',                      # Allow frontend to access the API
    'djmoney',                          # MoneyField for Django models
    'drf_spectacular',                  # OpenAPI 3.0 schema generator for Django REST framework 
    'drf_spectacular_sidecar',          # OpenAPI 3.0 UI 'Swagger UI' for Django REST framework 
    # Any shared apps between tenants, or general management
)

# ===============================
# TENANT_APPS
# ===============================
TENANT_APPS = (
    'admin_interface',
    'colorfield',
    # Django apps
    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.admin',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    "django.contrib.sites",             # Multiple sites in one Django project
    # التطبيقات الخاصة بالعميل فقط

    'core',
    'orders',
    'prescriptions',
    'products',
    'CRM',
    'HRM',
    'branches',
    'accounting',


)


# ===============================
# merge apps
# ===============================
INSTALLED_APPS = list(SHARED_APPS) + [app for app in TENANT_APPS if app not in SHARED_APPS]

X_FRAME_OPTIONS = 'SAMEORIGIN'
# ===============================
# Middleware
# ===============================
MIDDLEWARE = [
    'django_tenants.middleware.main.TenantMainMiddleware',  # يجب أن يأتي أولاً
    "corsheaders.middleware.CorsMiddleware",                    # Handles Cross-Origin Resource Sharing (CORS) for API requests        # Provides security enhancements such as HTTPS redirection
    "whitenoise.middleware.WhiteNoiseMiddleware",               # Serves static files efficiently in production
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    "simple_history.middleware.HistoryRequestMiddleware",       # Tracks model changes with django-simple-history
]

MIDDLEWARE = [

    "django.contrib.sessions.middleware.SessionMiddleware",     # Manages user sessions 
               # Provides common utilities like URL normalization
    # "django.middleware.csrf.CsrfViewMiddleware",              # Protects against Cross-Site Request Forgery (CSRF) attacks
    "django.contrib.auth.middleware.AuthenticationMiddleware",  # Handles user authentication
    "django.contrib.messages.middleware.MessageMiddleware",     # Enables message framework for temporary notifications
    "django.middleware.clickjacking.XFrameOptionsMiddleware",   # Prevents clickjacking attacks by setting X-Frame-Options (iframes)
    "allauth.account.middleware.AccountMiddleware",             # Manages user accounts and authentication with django-allauth
]
# ===============================
# TEMPLATES
# ===============================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        # Defines directories where Django should look for templates
        "DIRS": [os.path.join(BASE_DIR, "static")],  # Recommended to use "templates" instead of "static"

        'APP_DIRS': True,
        "OPTIONS": {
            "context_processors": [
                # Adds debugging context if DEBUG=True
                "django.template.context_processors.debug",
                
                # Makes the request object available in templates
                "django.template.context_processors.request",
                
                # Adds the authenticated user to the template context
                "django.contrib.auth.context_processors.auth",
                
                # Enables Django's messages framework in templates
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

SITE_ID = 1     # allauth needs to it select the current site & Default site ID for Django sites framework  

REST_USE_JWT = True  # Use JWT for authentication with Django REST framework

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # اجعل الوصول يتطلب التوثيق
    ]
}


# Reqiermant for production env : Gunicorn , uWSGI , Apache mod_wsgi.

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
# STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ===============================
# Other Settings
# ===============================
LANGUAGE_CODE = 'en-us'
# TIME_ZONE = 'UTC' 
TIME_ZONE = "Asia/Riyadh"   # timezone.get_current_timezone()
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ===============================
# Email Settings
# ===============================
TENANT_BASE_DOMAIN = config('TENANT_BASE_DOMAIN')
PORT = config('PORT', default=8000)
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

if DEBUG:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
else:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = config('EMAIL_HOST')
    EMAIL_PORT = config('EMAIL_PORT')
    EMAIL_USE_SSL = True
    EMAIL_USE_TLS = False
    EMAIL_HOST_USER = config('EMAIL_HOST_USER')
    EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD')
    DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
# Email Settings



# drf-spectacular settings  this optinat setting
SPECTACULAR_SETTINGS = {
    'TITLE': 'API Documentation',
    'DESCRIPTION': 'API for your project',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/',
}


# Security settings for production HTTPS
if not DEBUG:
    SECURE_HSTS_SECONDS =  86400           # Purpose: Enables HTTP Strict Transport Security (HSTS). For one Year =31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True   # Purpose: Applies HSTS to all subdomains.
    # SECURE_HSTS_PRELOAD = True              # Purpose: Enables HSTS preloading. need register in hstspreload.org.
    # SECURE_SSL_REDIRECT = False              # Purpose: Redirects all HTTP traffic to HTTPS.
    SESSION_COOKIE_SECURE = True            # Purpose: Ensures that session cookies are only sent over HTTPS.
    CSRF_COOKIE_SECURE = True               # Purpose: Ensures that the CSRF token cookie is only transmitted over HTTPS.
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https') # Purpose: Helps Django detect that it is behind a reverse proxy (e.g., Nginx, AWS ELB).

SECURE_CONTENT_TYPE_NOSNIFF = True      # Prevents browsers from guessing the content type of files.


#  CSRE Setting no neewd it with JWT
CSRF_COOKIE_NAME = "csrftoken"
CSRF_HEADER_NAME = "HTTP_X_CSRFTOKEN"
SESSION_COOKIE_NAME = "sessionid" 
CSRF_COOKIE_HTTPONLY = True #False


# JWT Settings
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=int(os.getenv("ACCESS_TOKEN_LIFETIME_MINUTES", 15))),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=int(os.getenv("REFRESH_TOKEN_LIFETIME_DAYS", 7))),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",)  #can add  "JWT"
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# Set email verification method: 
# In development (DEBUG=True), no email verification is required.
# In production (DEBUG=False), email verification is optional.
ACCOUNT_EMAIL_VERIFICATION = "none" if DEBUG else 'optional'
# ACCOUNT_SIGNUP_FIELDS = ['email*', 'username*', 'password1*', 'password2*']
# Enforce email requirement during registration.
# ACCOUNT_EMAIL_REQUIRED = True  # Email is required for registration.

# Allow login using either email or username.
ACCOUNT_LOGIN_METHODS = {'email', 'username'}  # Login can be done using email or username.
# ACCOUNT_AUTHENTICATION_METHOD = "username_email"  # Login can be done using email or username.

#  can change it to CustomLoginSerializer
REST_AUTH_SERIALIZERS = {
    'LOGIN_SERIALIZER': 'dj_rest_auth.serializers.LoginSerializer',
}
