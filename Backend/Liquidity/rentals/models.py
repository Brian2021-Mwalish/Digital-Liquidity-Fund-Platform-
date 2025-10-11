from django.db import models
from django.utils import timezone
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

    def __str__(self):
        return f"{self.user.email} — {self.currency} Rental ({self.status})"

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Rental"
        verbose_name_plural = "Rentals"
