# payments/models.py
from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL


class CurrencyProduct(models.Model):
    """
    Fixed currencies/products with system-defined prices.
    Example: CAD = 100 KES, AUD = 250 KES, etc.
    """
    code = models.CharField(max_length=10, unique=True)   # e.g. CAD, USD, EUR
    name = models.CharField(max_length=100)
    price_kes = models.PositiveIntegerField()             # fixed amount the user must pay
    active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.name} ({self.price_kes} KES)"


class MpesaPayment(models.Model):
    """
    Stores lifecycle of an STK Push payment.
    """
    STATUS_CHOICES = [
        ("initiated", "Initiated"),
        ("success", "Success"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="mpesa_payments")
    phone_number = models.CharField(max_length=20)   # E.164 format e.g. 2547XXXXXXXX
    currency = models.ForeignKey(CurrencyProduct, on_delete=models.PROTECT)
    amount = models.PositiveIntegerField()           # auto-filled from CurrencyProduct.price_kes

    merchant_request_id = models.CharField(max_length=64, blank=True)
    checkout_request_id = models.CharField(max_length=64, blank=True)

    result_code = models.CharField(max_length=10, blank=True)
    result_desc = models.TextField(blank=True)
    receipt_number = models.CharField(max_length=64, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="initiated")

    raw_callback = models.JSONField(default=dict, blank=True)  # full Safaricom callback

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.currency.code} {self.amount} KES ({self.status})"
