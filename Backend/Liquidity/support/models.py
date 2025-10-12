from django.db import models
from django.utils import timezone
from Users.models import CustomUser

# -----------------------
# Support Message Model
# -----------------------
class SupportMessage(models.Model):
    """
    Represents a support message sent by users.
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="support_messages")
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    reply = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"Support from {self.user.email} — {self.created_at}"

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Support Message"
        verbose_name_plural = "Support Messages"


# -----------------------
# System Settings Model
# -----------------------
class SystemSettings(models.Model):
    """
    Singleton model for global system settings.
    """
    maintenance_mode = models.BooleanField(default=False, help_text="Enable maintenance mode to restrict access for non-admins")
    email_notifications = models.BooleanField(default=True, help_text="Enable email notifications for system events")

    def __str__(self):
        return "System Settings"

    class Meta:
        verbose_name = "System Setting"
        verbose_name_plural = "System Settings"

    @classmethod
    def get_settings(cls):
        """Get or create the singleton settings instance."""
        settings, created = cls.objects.get_or_create(id=1, defaults={'maintenance_mode': False, 'email_notifications': True})
        return settings
