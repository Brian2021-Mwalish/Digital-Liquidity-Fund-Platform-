# withdrawal/serializers.py
from rest_framework import serializers
from .models import Withdrawal


# -----------------------
# Serializer for User Requests
# -----------------------
class WithdrawalRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Withdrawal
        fields = ["id", "mobile_number", "amount", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]

    def validate_amount(self, value):
        """Prevent invalid withdrawal amounts"""
        if value <= 0:
            raise serializers.ValidationError("Withdrawal amount must be greater than zero.")
        return value


# -----------------------
# Serializer for Admin Dashboard
# -----------------------
class WithdrawalAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Withdrawal
        fields = [
            "id",
            "user_email",
            "mobile_number",
            "amount",
            "status",
            "created_at",
            "processed_at",
        ]
        read_only_fields = ["id", "user_email", "mobile_number", "amount", "created_at", "processed_at", "status"]
