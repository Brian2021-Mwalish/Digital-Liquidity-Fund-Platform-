import os
from pathlib import Path
from decouple import config
from datetime import timedelta, datetime
import base64

# -------------------
# Paths
BASE_DIR = Path(__file__).resolve().parent.parent

# -------------------
# Security
SECRET_KEY = config('DJANGO_SECRET_KEY', default='your-secret-key')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='').split(',')

# -------------------
# Installed apps
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Local apps
    'Users',
    'payment',
]

# Google OAuth
GOOGLE_CLIENT_ID = config('GOOGLE_CLIENT_ID', default='YOUR_GOOGLE_CLIENT_ID')

# -------------------
# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be first
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# -------------------
# URL config
ROOT_URLCONF = 'Liquidity.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
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

WSGI_APPLICATION = 'Liquidity.wsgi.application'

# -------------------
# Frontend URL (for CORS)
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:5173')

# -------------------
# Database (PostgreSQL)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='Liquidity'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='12345678'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# -------------------
# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# -------------------
# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True

# -------------------
# Static & Media
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static'] if (BASE_DIR / "static").exists() else []

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# -------------------
# Default primary key
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# -------------------
# Custom user
AUTH_USER_MODEL = 'Users.CustomUser'

# -------------------
# Django REST Framework + JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# -------------------
# Simple JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
}

# -------------------
# CORS settings
CORS_ALLOW_ALL_ORIGINS = True  # Dev only
CORS_ALLOW_CREDENTIALS = True

# -------------------
# 📧 Gmail SMTP (for password reset & notifications)
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="mwalish2021@gmail.com")
EMAIL_HOST_PASSWORD = config("EMAIL_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default=EMAIL_HOST_USER)

# -------------------
# M-PESA sandbox config
MPESA_ENV = config("MPESA_ENV", default="sandbox")
MPESA_BASE_URL = config("MPESA_BASE_URL", default="https://sandbox.safaricom.co.ke")
MPESA_CONSUMER_KEY = config("MPESA_CONSUMER_KEY", default="")
MPESA_CONSUMER_SECRET = config("MPESA_CONSUMER_SECRET", default="")

# 🔐 STK Push credentials
MPESA_SHORTCODE = config("MPESA_SHORTCODE", default="")
MPESA_PASSKEY = config("MPESA_PASSKEY", default="")
MPESA_CALLBACK_URL = config("MPESA_CALLBACK_URL", default="")

# Optional B2C / reversals
MPESA_INITIATOR_NAME = config("MPESA_INITIATOR_NAME", default="")
MPESA_INITIATOR_PASSWORD = config("MPESA_INITIATOR_PASSWORD", default="")

# Helper for Authorization header (Base64 encoded)
MPESA_BASE64_ENCODED_CREDENTIALS = base64.b64encode(
    f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}".encode()
).decode()

# Timestamp for STK Push (YYYYMMDDHHMMSS)
MPESA_TIMESTAMP = datetime.now().strftime("%Y%m%d%H%M%S")

# Password for STK Push
MPESA_PASSWORD = base64.b64encode(
    f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{MPESA_TIMESTAMP}".encode()
).decode()

# -------------------
# Logging (optional)
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG' if DEBUG else 'INFO',
    },
}
