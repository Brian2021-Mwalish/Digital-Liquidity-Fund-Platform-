# payments/models.py
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
from Users.models import CustomUser


# -----------------------
# Wallet Model
# -----------------------
class Wallet(models.Model):
    """
    Each user has one wallet that tracks their KES balance.
    Updated automatically whenever balance changes or user is created.
    """
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="wallet")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} — Balance: {self.balance:.2f} KES"

    class Meta:
        ordering = ["-last_updated"]
        verbose_name = "Wallet"
        verbose_name_plural = "Wallets"


# -----------------------
# Payment Model
# -----------------------
class Payment(models.Model):
    """
    Represents a single payment (e.g., M-PESA top-up or currency rental).
    All transactions are stored in KES, even if user selected another currency.
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
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="payments")
    currency = models.CharField(max_length=3, default="KES")
    amount_deducted = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="completed")
    checkout_request_id = models.CharField(max_length=50, blank=True, null=True, help_text="M-PESA CheckoutRequestID for STK Push tracking")

    def __str__(self):
        return f"{self.user.email} — {self.amount_deducted:.2f} {self.currency} ({self.status})"

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Payment"
        verbose_name_plural = "Payments"


# -----------------------
# Signals → Auto-create Wallet when a user is created
# -----------------------
@receiver(post_save, sender=CustomUser)
def create_user_wallet(sender, instance, created, **kwargs):
    """Automatically create a wallet when a new user is registered."""
    if created:
        Wallet.objects.create(user=instance)


@receiver(post_save, sender=CustomUser)
def save_user_wallet(sender, instance, **kwargs):
    """Ensure wallet is saved whenever the user is updated."""
    if hasattr(instance, "wallet"):
        instance.wallet.save()
