# payments/serializers.py
from rest_framework import serializers
from .models import Wallet, Payment


# ---------------------------
# Wallet Serializer
# ---------------------------
class WalletSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Wallet
        fields = [
            "id",
            "user",
            "username",
            "user_email",
            "balance",
            "last_updated",
        ]
        read_only_fields = [
            "id",
            "user",
            "username",
            "user_email",
            "last_updated",
        ]


# ---------------------------
# Payment Serializer
# ---------------------------
class PaymentSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    amount_deducted = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "user",
            "username",
            "user_email",
            "currency",
            "amount_deducted",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "username",
            "user_email",
            "status",
            "created_at",
            "amount_deducted",
        ]
