from rest_framework import serializers
from .models import SupportMessage, SystemSettings

# ---------------------------
# Support Message Serializer
# ---------------------------
class SupportMessageSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = SupportMessage
        fields = [
            "id",
            "user",
            "username",
            "user_email",
            "name",
            "email",
            "message",
            "reply",
            "created_at",
            "is_read",
        ]
        read_only_fields = [
            "id",
            "user",
            "username",
            "user_email",
            "created_at",
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


# ---------------------------
# System Settings Serializer
# ---------------------------
class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = ["maintenance_mode", "email_notifications"]
