# payment/serializers.py
from rest_framework import serializers
from .models import CurrencyProduct, MpesaPayment


class CurrencyProductSerializer(serializers.ModelSerializer):
    """
    Serializer for available currency products (CAD, USD, etc.)
    """
    class Meta:
        model = CurrencyProduct
        fields = ["id", "code", "name", "price_kes", "active"]


class MpesaPaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing MpesaPayment records.
    """
    currency = CurrencyProductSerializer(read_only=True)

    class Meta:
        model = MpesaPayment
        fields = [
            "id",
            "user",
            "phone_number",
            "currency",
            "amount",
            "merchant_request_id",
            "checkout_request_id",
            "result_code",
            "result_desc",
            "receipt_number",
            "status",
            "raw_callback",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "user",
            "amount",
            "merchant_request_id",
            "checkout_request_id",
            "result_code",
            "result_desc",
            "receipt_number",
            "status",
            "raw_callback",
            "created_at",
            "updated_at",
        ]


class StartStkPushSerializer(serializers.Serializer):
    """
    Validates frontend request to initiate STK Push.
    Frontend only provides phone_number and currency_code.
    Amount is determined by backend.
    """
    phone_number = serializers.RegexField(
        regex=r"^2547\d{8}$",  # e.g. 254712345678
        max_length=12
    )
    currency_code = serializers.CharField(max_length=10)
