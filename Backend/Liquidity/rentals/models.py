from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid
from Users.models import CustomUser


class Rental(models.Model):
    """
    Represents a currency rental created upon successful payment.
    Tracks the rental details and expected return.
    """
    CURRENCY_CHOICES = [
        ("KES", "Kenyan Shilling"),
        ("CAD", "Canadian Dollar"),
        ("AUD", "Australian Dollar"),
        ("GBP", "British Pound Sterling"),
        ("JPY", "Japanese Yen"),
        ("EUR", "Euro"),
        ("USD", "US Dollar"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="rentals")
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)  # Amount paid for rental
    expected_return = models.DecimalField(max_digits=12, decimal_places=2)  # Expected return (e.g., amount * 2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(default=timezone.now)
    duration_days = models.PositiveIntegerField(default=20)  # Duration in days
    end_date = models.DateTimeField(null=True, blank=True)  # Calculated end date
    unique_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)  # Unique identifier

    def save(self, *args, **kwargs):
        if not self.end_date:
            self.end_date = self.created_at + timedelta(days=self.duration_days)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} — {self.currency} Rental ({self.status}) - ID: {self.unique_id}"

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Rental"
        verbose_name_plural = "Rentals"
