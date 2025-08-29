# withdrawal/models.py
from django.db import models
from django.utils import timezone
from Users.models import CustomUser


# -----------------------
# Withdrawal Request
# -----------------------
class Withdrawal(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),       # created, waiting for admin
        ("processing", "Processing"), # after 48 hours
        ("paid", "Paid"),             # admin has confirmed payment
        ("rejected", "Rejected"),     # admin rejected
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="withdrawals")
    mobile_number = models.CharField(max_length=15)  # e.g., MPesa number
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    processed_at = models.DateTimeField(null=True, blank=True)  # when admin marks as paid/rejected

    class Meta:
        ordering = ["-created_at"]  # newest first

    def clean(self):
        """Validation to prevent invalid amounts"""
        if self.amount <= 0:
            raise ValueError("Withdrawal amount must be greater than zero.")

    def mark_as_paid(self):
        """Admin confirms withdrawal has been paid."""
        self.status = "paid"
        self.processed_at = timezone.now()
        self.save()

    def reject(self):
        """Admin rejects withdrawal."""
        self.status = "rejected"
        self.processed_at = timezone.now()
        self.save()

    def move_to_processing(self):
        """Optional: Move to processing if 48h has passed"""
        if self.status == "pending" and (timezone.now() - self.created_at).total_seconds() >= 172800:
            self.status = "processing"
            self.save()

    def __str__(self):
        return f"Withdrawal {self.amount} KES by {self.user.email} - {self.status}"
