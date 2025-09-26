from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, UserSession, KYCProfile


# -----------------------
# User Serializer
# -----------------------
class UserSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "email",
            "full_name",
            "date_joined",
            "is_active",
            "username",
            "first_name",
            "last_name",
            "is_superuser",
            "wallet_balance",
        ]

    def get_username(self, obj):
        if obj.email and isinstance(obj.email, str) and "@" in obj.email:
            return obj.email.split("@")[0]
        return ""

    def get_first_name(self, obj):
        full_name = obj.full_name if obj.full_name and isinstance(obj.full_name, str) else ""
        if hasattr(obj, "first_name") and obj.first_name:
            return obj.first_name
        if full_name:
            return full_name.split(" ")[0]
        return ""

    def get_last_name(self, obj):
        full_name = obj.full_name if obj.full_name and isinstance(obj.full_name, str) else ""
        if hasattr(obj, "last_name") and obj.last_name:
            return obj.last_name
        if full_name and len(full_name.split(" ")) > 1:
            return " ".join(full_name.split(" ")[1:])
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
# Login Serializer (with JWT)
# -----------------------
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Customize JWT to authenticate with email instead of username"""
    username_field = CustomUser.USERNAME_FIELD  # "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token["email"] = user.email
        token["full_name"] = user.full_name
        token["is_superuser"] = user.is_superuser
        return token

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(request=self.context.get("request"), email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")

        data = super().validate(attrs)
        data["user"] = UserSerializer(user).data
        return data


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


# -----------------------
# KYC Profile Serializer
# -----------------------
class KYCProfileSerializer(serializers.ModelSerializer):
    national_id = serializers.CharField(source="id_number")
    status = serializers.SerializerMethodField()
    date_submitted = serializers.DateTimeField(source="submitted_at", read_only=True)

    class Meta:
        model = KYCProfile
        fields = [
            "id",
            "user",
            "full_name",
            "email",
            "phone_number",
            "national_id",
            "date_of_birth",
            "address",
            "status",
            "date_submitted",
        ]

    def get_status(self, obj):
        return "verified" if obj.is_verified else "pending"


# -----------------------
# User Profile Serializer
# -----------------------
class UserProfileSerializer(serializers.ModelSerializer):
    kyc = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ["id", "email", "full_name", "phone_number", "kyc", "is_superuser", "wallet_balance"]

    def get_kyc(self, obj):
        kyc = getattr(obj, "kyc", None)
        if kyc:
            return KYCProfileSerializer(kyc).data
        return None
