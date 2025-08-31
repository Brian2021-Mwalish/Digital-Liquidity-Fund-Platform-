# users/serializers.py
from rest_framework import serializers
from .models import CustomUser, UserSession


# -----------------------
# User Serializer
# -----------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "full_name", "date_joined", "is_active", "username", "first_name", "last_name"]

    # Add username, first_name, last_name for compatibility with frontend
    username = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    def get_username(self, obj):
        if obj.email and isinstance(obj.email, str) and '@' in obj.email:
            return obj.email.split('@')[0]
        return ""

    def get_first_name(self, obj):
        full_name = obj.full_name if obj.full_name and isinstance(obj.full_name, str) else ""
        if hasattr(obj, 'first_name') and obj.first_name:
            return obj.first_name
        if full_name:
            return full_name.split(' ')[0]
        return ""

    def get_last_name(self, obj):
        full_name = obj.full_name if obj.full_name and isinstance(obj.full_name, str) else ""
        if hasattr(obj, 'last_name') and obj.last_name:
            return obj.last_name
        if full_name and len(full_name.split(' ')) > 1:
            return ' '.join(full_name.split(' ')[1:])
        return ""


# -----------------------
# Register Serializer
# -----------------------
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["email", "full_name", "password", "confirm_password"]

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            full_name=validated_data["full_name"],
            password=validated_data["password"],
        )
        return user


# -----------------------
# Login Serializer
# -----------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


# -----------------------
# User Session Serializer
# -----------------------
class UserSessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserSession
        fields = [
            "id",
            "user",
            "session_key",
            "device",
            "ip_address",
            "login_time",
            "logout_time",
            "is_active",
        ]
