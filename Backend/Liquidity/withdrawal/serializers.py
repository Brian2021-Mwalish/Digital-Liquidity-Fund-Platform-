# withdrawal/serializers.py
from rest_framework import serializers
from .models import Withdrawal


# ---------------------------
# Serializer for client withdrawal requests
# ---------------------------
class WithdrawalCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a withdrawal request by the client."""

    class Meta:
        model = Withdrawal
        fields = ["id", "mobile_number", "amount"]  # only required from client
        read_only_fields = ["id"]

    def validate_amount(self, value):
        """Ensure amount is positive before saving."""
        if value <= 0:
            raise serializers.ValidationError(
                "Withdrawal amount must be greater than zero."
            )
        return value


# ---------------------------
# Serializer for listing withdrawals (user & admin)
# ---------------------------
class WithdrawalSerializer(serializers.ModelSerializer):
    """Serializer for returning withdrawal details."""

    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.SerializerMethodField()
    user_phone_number = serializers.CharField(
        source="user.phone_number", read_only=True
    )  # from User model

    def get_user_name(self, obj):
        """Try first_name + last_name, fallback to full_name, then username."""
        user = obj.user
        if getattr(user, "first_name", None) and getattr(user, "last_name", None):
            return f"{user.first_name} {user.last_name}"
        if getattr(user, "full_name", None):
            return user.full_name
        if getattr(user, "username", None):
            return user.username
        return "Unknown User"

    class Meta:
        model = Withdrawal
        fields = [
            "id",
            "user",
            "user_email",
            "user_name",
            "user_phone_number",
            "mobile_number",  # number provided for withdrawal
            "amount",
            "status",
            "created_at",
            "processed_at",
        ]
        read_only_fields = ["user", "status", "created_at", "processed_at"]


# ---------------------------
# Serializer for admin status updates
# ---------------------------
class WithdrawalStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating withdrawal status by admin."""

    class Meta:
        model = Withdrawal
        fields = ["status"]

    def validate_status(self, value):
        """Ensure status is valid and part of allowed workflow."""
        valid_statuses = [choice[0] for choice in Withdrawal.STATUS_CHOICES]
        if value not in valid_statuses:
            raise serializers.ValidationError("Invalid status.")

        # Optional: enforce workflow transitions
        instance = self.instance
        if instance:
            if instance.status == "pending" and value not in ["approved", "rejected"]:
                raise serializers.ValidationError(
                    "Pending withdrawals can only be approved or rejected."
                )
            if instance.status == "approved" and value != "paid":
                raise serializers.ValidationError(
                    "Approved withdrawals can only be marked as paid."
                )
            if instance.status in ["paid", "rejected"]:
                raise serializers.ValidationError(
                    "This withdrawal has already been finalized."
                )

        return value
