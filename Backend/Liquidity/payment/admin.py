# payments/admin.py
from django.contrib import admin
from .models import Wallet, Payment


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Wallet model.
    Displays user, balance, and last update info.
    """
    list_display = ("user", "balance", "last_updated")
    list_filter = ("last_updated",)
    search_fields = ("user__email", "user__username")
    readonly_fields = ("last_updated",)
    ordering = ("-last_updated",)
    list_per_page = 25  # ✅ Pagination for performance


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """
    Admin configuration for Payment model.
    Allows quick view and filtering of all transactions.
    """
    list_display = ("user", "amount_deducted", "currency", "status", "created_at")
    list_filter = ("status", "currency", "created_at")
    search_fields = ("user__email", "user__username")
    readonly_fields = ("created_at",)
    ordering = ("-created_at",)
    list_per_page = 25  # ✅ Prevents admin slowdown on large datasets
