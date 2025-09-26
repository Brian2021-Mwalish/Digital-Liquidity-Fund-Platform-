# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserSession, Referral, KYCProfile


# -----------------------
# Custom User Admin
# -----------------------
class CustomUserAdmin(UserAdmin):
    model = CustomUser

    # Show referral details + stats
    list_display = (
        "id",
        "email",
        "full_name",
        "referral_code",        # ✅ user’s own referral code
        "referred_by_email",    # ✅ clickable referrer
        "referral_count",       # ✅ how many people this user referred
        "is_active",
        "is_staff",
        "date_joined",
    )
    list_filter = (
        "is_active",
        "is_staff",
        "is_superuser",
        "date_joined",
    )
    search_fields = (
        "email",
        "full_name",
        "referral_code",        # ✅ allow searching by referral code
        "referred_by__email",   # ✅ allow searching by referrer’s email
    )
    ordering = ("-date_joined",)

    # Add referral info section in user detail
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("full_name", "phone_number")}),
        ("Referral Info", {"fields": ("referral_code", "referred_by", "wallet_balance")}),  # ✅ wallet + referrals
        ("Permissions", {
            "fields": (
                "is_active",
                "is_staff",
                "is_superuser",
                "groups",
                "user_permissions",
            )
        }),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": (
                "email",
                "full_name",
                "password1",
                "password2",
                "is_active",
                "is_staff",
            ),
        }),
    )

    # -----------------------
    # Custom Display Methods
    # -----------------------
    def referred_by_email(self, obj):
        """Show referrer’s email (clickable in admin)."""
        return obj.referred_by.email if obj.referred_by else "-"
    referred_by_email.admin_order_field = "referred_by"
    referred_by_email.short_description = "Referred By"

    def referral_count(self, obj):
        """Show how many users this person referred."""
        return obj.referrals.count()
    referral_count.short_description = "Referrals"


# -----------------------
# Referral Admin
# -----------------------
class ReferralAdmin(admin.ModelAdmin):
    model = Referral
    list_display = (
        "id",
        "referrer_email",
        "referred_email",
        "status",
        "reward",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("referrer__email", "referred_email")
    ordering = ("-created_at",)

    # Custom display helpers
    def referrer_email(self, obj):
        return obj.referrer.email if obj.referrer else "-"
    referrer_email.short_description = "Referrer"

    def referred_email(self, obj):
        return obj.referred.email if obj.referred else obj.referred_email
    referred_email.short_description = "Referred"


# -----------------------
# User Session Admin
# -----------------------
class UserSessionAdmin(admin.ModelAdmin):
    model = UserSession
    list_display = (
        "id",
        "user",
        "session_key",
        "device",
        "ip_address",
        "login_time",
        "logout_time",
        "is_active",
    )
    list_filter = ("is_active", "login_time", "logout_time")
    search_fields = ("user__email", "session_key", "device", "ip_address")
    ordering = ("-login_time",)


# -----------------------
# KYC Profile Admin
# -----------------------
@admin.register(KYCProfile)
class KYCProfileAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'full_name',
        'email',
        'address',
        'date_of_birth',
        # Only include fields that exist in your model!
    )
    search_fields = (
        'full_name',
        'email',
        'address',
    )
    # Remove list_filter and readonly_fields if those fields do not exist


# -----------------------
# Register models
# -----------------------
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(UserSession, UserSessionAdmin)
admin.site.register(Referral, ReferralAdmin)
