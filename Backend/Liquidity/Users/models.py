# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
import uuid


# -----------------------
# Utility: Referral Code Generator
# -----------------------
def generate_referral_code():
    """Generate a short unique referral code"""
    return uuid.uuid4().hex[:12]


# -----------------------
# Custom User Manager
# -----------------------
class CustomUserManager(BaseUserManager):
    def create_user(self, email, full_name, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")

        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)

        # Ensure referral code is set
        if not user.referral_code:
            user.referral_code = generate_referral_code()

        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, full_name, password, **extra_fields)


# -----------------------
# Custom User Model
# -----------------------
class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, db_index=True)
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    date_joined = models.DateTimeField(default=timezone.now)

    # Referral system
    referral_code = models.CharField(max_length=12, unique=True, blank=True, null=True)
    referred_by = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="referrals"
    )
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Admin flags
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    def save(self, *args, **kwargs):
        # Auto-generate referral code if missing
        if not self.referral_code:
            code = generate_referral_code()
            while CustomUser.objects.filter(referral_code=code).exists():
                code = generate_referral_code()
            self.referral_code = code
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email


# -----------------------
# Referral Model
# -----------------------
class Referral(models.Model):
    referrer = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="referrer_history"
    )
    referred = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="referred_account",
        null=True,
        blank=True
    )
    referred_email = models.EmailField()
    referred_name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(
        max_length=20,
        choices=[("pending", "Pending"), ("completed", "Completed")],
        default="pending"
    )
    reward = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        unique_together = ("referrer", "referred_email")

    def __str__(self):
        return f"{self.referrer.email} referred {self.referred_email}"


# -----------------------
# User Session Tracking
# -----------------------
class UserSession(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="sessions")
    session_key = models.CharField(max_length=255, unique=True)
    device = models.CharField(max_length=255, blank=True, null=True)   # e.g., "Chrome on Windows"
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    login_time = models.DateTimeField(default=timezone.now)
    logout_time = models.DateTimeField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def end_session(self):
        """Mark session as ended"""
        self.logout_time = timezone.now()
        self.is_active = False
        self.save()

    def __str__(self):
        return f"{self.user.email} - {self.session_key}"


# -----------------------
# KYC Profile
# -----------------------
class KYCProfile(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="kyc"
    )
    # Autofilled from registration
    email = models.EmailField(editable=False)
    full_name = models.CharField(max_length=255, editable=False)

    # Editable by user
    id_number = models.CharField(max_length=50, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(default=timezone.now)

    def save(self, *args, **kwargs):
        # Autofill email and full_name from user on creation
        if not self.email:
            self.email = self.user.email
        if not self.full_name:
            self.full_name = self.user.full_name
        super().save(*args, **kwargs)

    def __str__(self):
        return f"KYC for {self.user.email}"
