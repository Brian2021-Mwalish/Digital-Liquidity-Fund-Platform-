# payments/models.py
from django.db import models
from django.utils import timezone
from Users.models import CustomUser


# -----------------------
# Wallet Model
# -----------------------
class Wallet(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="wallet")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    last_updated = models.DateTimeField(auto_now=True)  # ✅ tracks when balance changes

    def __str__(self):
        return f"{self.user.email} - Balance: {self.balance} KES"


# -----------------------
# Payment Model
# -----------------------
class Payment(models.Model):
    CURRENCY_CHOICES = [
        ("KES", "Kenyan Shilling"),  
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="payments")
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default="KES")
    amount_deducted = models.DecimalField(max_digits=12, decimal_places=2)  # always in KES
    created_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, default="completed")  # completed, failed, pending

    def __str__(self):
        return f"{self.user.email} - {self.amount_deducted} {self.currency}"
