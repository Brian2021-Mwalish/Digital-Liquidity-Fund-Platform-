# withdrawal/models.py
from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from Users.models import CustomUser


# -----------------------
# Withdrawal Request Model
# -----------------------
class Withdrawal(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),        # created, waiting for admin
        ("processing", "Processing"),  # auto after 48 hours (optional)
        ("approved", "Approved"),      # admin approved the withdrawal
        ("paid", "Paid"),              # admin has confirmed payment
        ("rejected", "Rejected"),      # admin rejected
    ]

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="withdrawals"
    )
    mobile_number = models.CharField(max_length=15)  # e.g., MPesa number
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )
    processed_at = models.DateTimeField(null=True, blank=True)  # when admin processes (approve/reject/paid)

    class Meta:
        ordering = ["-created_at"]  # newest first

    # -----------------------
    # Validation
    # -----------------------
    def clean(self):
        """Validation to prevent invalid amounts."""
        if self.amount <= 0:
            raise ValidationError("Withdrawal amount must be greater than zero.")

    # -----------------------
    # Admin workflow helpers
    # -----------------------
    def approve(self):
        """Admin approves withdrawal."""
        if self.status != "pending":
            raise ValidationError("Only pending withdrawals can be approved.")
        self.status = "approved"
        self.processed_at = timezone.now()
        self.save(update_fields=["status", "processed_at"])

    def mark_as_paid(self):
        """Admin confirms withdrawal has been paid."""
        if self.status not in ["approved", "pending", "processing"]:
            raise ValidationError("Only approved or processing withdrawals can be marked as paid.")
        self.status = "paid"
        self.processed_at = timezone.now()
        self.save(update_fields=["status", "processed_at"])

    def reject(self):
        """Admin rejects withdrawal."""
        if self.status != "pending":
            raise ValidationError("Only pending withdrawals can be rejected.")
        self.status = "rejected"
        self.processed_at = timezone.now()
        self.save(update_fields=["status", "processed_at"])

    def move_to_processing(self):
        """Move to processing if 48h has passed since request (manual or cronjob trigger)."""
        if self.status == "pending" and (timezone.now() - self.created_at).total_seconds() >= 172800:
            self.status = "processing"
            self.save(update_fields=["status"])

    # -----------------------
    # Display
    # -----------------------
    def __str__(self):
        return f"Withdrawal {self.amount} KES by {self.user.email} - {self.status} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
