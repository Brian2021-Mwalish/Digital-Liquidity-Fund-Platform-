# payments/admin.py
from django.contrib import admin
from .models import Wallet, Payment


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ("user", "balance", "last_updated")  # ✅ matches Wallet model
    list_filter = ("last_updated",)
    search_fields = ("user__email",)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("user", "amount_deducted", "currency", "created_at", "status")  # ✅ use created_at
    list_filter = ("status", "created_at")  # ✅ use created_at
    search_fields = ("user__email",)
