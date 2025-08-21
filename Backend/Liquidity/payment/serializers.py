# payments/serializers.py
from rest_framework import serializers
from .models import Wallet, Payment

class WalletSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Wallet
        fields = ["id", "user", "user_email", "balance", "last_updated"]
        read_only_fields = ["id", "user", "user_email", "last_updated"]


class PaymentSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Payment
        fields = ["id", "user", "user_email", "currency", "amount_deducted", "status", "created_at"]
        read_only_fields = ["id", "user", "user_email", "status", "created_at"]
