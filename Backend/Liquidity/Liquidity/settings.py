import os
from pathlib import Path
from datetime import timedelta, datetime
import base64
from decouple import config

# ------------------------------------------------------------
# BASE DIRECTORY
BASE_DIR = Path(__file__).resolve().parent.parent

# ------------------------------------------------------------
# SECURITY
SECRET_KEY = config("DJANGO_SECRET_KEY", default="your-secret-key")
DEBUG = config("DEBUG", default=False, cast=bool)

# Allowed hosts for your domain
ALLOWED_HOSTS = [
    "liquiinvestke.co.ke",
    "www.liquiinvestke.co.ke",
    "127.0.0.1",
    "localhost",
]

# ------------------------------------------------------------
# INSTALLED APPS
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third party
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",

    # Local apps
    "Users",
    "payment",
    "withdrawal",
    "rentals",
    "support",
]

# ------------------------------------------------------------
# MIDDLEWARE
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ------------------------------------------------------------
# URLS & WSGI
ROOT_URLCONF = "Liquidity.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "Liquidity.wsgi.application"

# ------------------------------------------------------------
# DATABASE — PostgreSQL
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("DB_NAME", default="cpanelusername_dbname"),
        "USER": config("DB_USER", default="cpanelusername_dbuser"),
        "PASSWORD": config("DB_PASSWORD", default=""),
        "HOST": config("DB_HOST", default="localhost"),
        "PORT": config("DB_PORT", default="5432"),
    }
}

# ------------------------------------------------------------
# AUTH & PASSWORD VALIDATION
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTH_USER_MODEL = "Users.CustomUser"

# ------------------------------------------------------------
# INTERNATIONALIZATION
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Nairobi"
USE_I18N = True
USE_TZ = True

# ------------------------------------------------------------
# STATIC & MEDIA FILES
# Static files are collected in one folder after `collectstatic`
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# If you also have some dev static files:
if (BASE_DIR / "static").exists():
    STATICFILES_DIRS = [BASE_DIR / "static"]

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ------------------------------------------------------------
# REST FRAMEWORK & JWT
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ------------------------------------------------------------
# CORS SETTINGS
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "https://liquiinvestke.co.ke",
    "https://www.liquiinvestke.co.ke",
]

# If you want to allow any origin temporarily during testing
# CORS_ALLOW_ALL_ORIGINS = True

# ------------------------------------------------------------
# EMAIL (GMAIL SMTP)
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_PASSWORD", default="")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default=EMAIL_HOST_USER)

# ------------------------------------------------------------
# M-PESA CONFIG
MPESA_ENV = config("MPESA_ENV", default="production")
MPESA_BASE_URL = (
    "https://sandbox.safaricom.co.ke"
    if MPESA_ENV == "sandbox"
    else "https://api.safaricom.co.ke"
)
MPESA_CONSUMER_KEY = config("MPESA_CONSUMER_KEY", default="")
MPESA_CONSUMER_SECRET = config("MPESA_CONSUMER_SECRET", default="")
MPESA_SHORTCODE = config("MPESA_SHORTCODE", default="")
MPESA_PASSKEY = config("MPESA_PASSKEY", default="")
MPESA_CALLBACK_URL = config("MPESA_CALLBACK_URL", default="")
MPESA_INITIATOR_NAME = config("MPESA_INITIATOR_NAME", default="")
MPESA_INITIATOR_PASSWORD = config("MPESA_INITIATOR_PASSWORD", default="")

MPESA_BASE64_ENCODED_CREDENTIALS = base64.b64encode(
    f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}".encode()
).decode()

MPESA_TIMESTAMP = datetime.now().strftime("%Y%m%d%H%M%S")

MPESA_PASSWORD = base64.b64encode(
    f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{MPESA_TIMESTAMP}".encode()
).decode()

# ------------------------------------------------------------
# LOGGING
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "root": {
        "handlers": ["console"],
        "level": "DEBUG" if DEBUG else "INFO",
    },
}

# ------------------------------------------------------------
# SECURITY HEADERS (Optional but good practice)
CSRF_TRUSTED_ORIGINS = [
    "https://liquiinvestke.co.ke",
    "https://www.liquiinvestke.co.ke",
]
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
