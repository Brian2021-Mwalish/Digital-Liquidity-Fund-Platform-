# payment/admin.py
from django.contrib import admin
from .models import CurrencyProduct, MpesaPayment


@admin.register(CurrencyProduct)
class CurrencyProductAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "price_kes", "active")
    list_filter = ("active",)
    search_fields = ("code", "name")


@admin.register(MpesaPayment)
class MpesaPaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "phone_number",
        "currency",
        "amount",
        "status",
        "receipt_number",
        "created_at",
    )
    list_filter = ("status", "currency")
    search_fields = ("phone_number", "receipt_number", "checkout_request_id")
    readonly_fields = (
        "merchant_request_id",
        "checkout_request_id",
        "result_code",
        "result_desc",
        "raw_callback",
        "created_at",
        "updated_at",
    )
