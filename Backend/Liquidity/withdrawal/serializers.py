# withdrawal/serializers.py
from rest_framework import serializers
from .models import Withdrawal


# ---------------------------
# Serializer for client requests
# ---------------------------
class WithdrawalCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a withdrawal request by the client."""

    class Meta:
        model = Withdrawal
        fields = ["id", "mobile_number", "amount"]  # only these are required from client

    def validate_amount(self, value):
        """Ensure amount is positive before saving."""
        if value <= 0:
            raise serializers.ValidationError("Withdrawal amount must be greater than zero.")
        return value


# ---------------------------
# Serializer for listing withdrawals (user & admin)
# ---------------------------
class WithdrawalSerializer(serializers.ModelSerializer):
    """Serializer for returning withdrawal details."""

    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.SerializerMethodField()
    user_phone = serializers.CharField(source="mobile_number", read_only=True)

    def get_user_name(self, obj):
        # Try first_name + last_name, fallback to full_name, then username
        user = obj.user
        if hasattr(user, 'first_name') and hasattr(user, 'last_name') and user.first_name and user.last_name:
            return f"{user.first_name} {user.last_name}"
        if hasattr(user, 'full_name') and user.full_name:
            return user.full_name
        if hasattr(user, 'username') and user.username:
            return user.username
        return "Unknown User"

    class Meta:
        model = Withdrawal
        fields = [
            "id",
            "user",
            "user_email",
            "user_name",
            "user_phone",
            "mobile_number",
            "amount",
            "status",
            "created_at",
            "processed_at",
        ]
        read_only_fields = ["user", "status", "created_at", "processed_at"]


# ---------------------------
# Serializer for admin status update
# ---------------------------
class WithdrawalStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating withdrawal status by admin."""

    class Meta:
        model = Withdrawal
        fields = ["status"]

    def validate_status(self, value):
        if value not in dict(Withdrawal.STATUS_CHOICES):
            raise serializers.ValidationError("Invalid status.")
        return value
