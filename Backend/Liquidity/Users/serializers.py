# users/serializers.py
from rest_framework import serializers
from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["email", "full_name", "password"]

    def validate_full_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Full name is required.")
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Full name must be at least 3 characters.")
        return value

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        # Extra logic can be added here if needed
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        from django.contrib.auth import authenticate

        user = authenticate(email=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        data["user"] = user
        # Return is_superuser as integer for reliable frontend detection
        data["is_superuser"] = 1 if getattr(user, "is_superuser", False) else 0
        return data


# -------------------------
# Serializer for Google OAuth
# -------------------------
class GoogleLoginSerializer(serializers.Serializer):
    credential = serializers.CharField(write_only=True)

    def validate_credential(self, value):
        if not value:
            raise serializers.ValidationError("Google credential is required.")
        return value
