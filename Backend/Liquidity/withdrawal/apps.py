# withdrawal/apps.py
from django.apps import AppConfig


class WithdrawalConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "withdrawal"

    def ready(self):
        # Import signals so they're registered when the app is ready
        import withdrawal.signals  # noqa
