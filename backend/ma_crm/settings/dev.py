from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'backend']

# Additional development settings
CORS_ALLOW_ALL_ORIGINS = True

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Additional logging for development
LOGGING['loggers']['apps'] = {
    'handlers': ['console'],
    'level': 'DEBUG',
    'propagate': False,
}