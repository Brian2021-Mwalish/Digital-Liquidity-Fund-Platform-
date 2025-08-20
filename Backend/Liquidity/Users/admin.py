# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserSession


# -----------------------
# Custom User Admin
# -----------------------
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ("id", "email", "full_name", "is_active", "is_staff", "date_joined")
    list_filter = ("is_active", "is_staff", "is_superuser", "date_joined")
    search_fields = ("email", "full_name")
    ordering = ("-date_joined",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("full_name",)}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "full_name", "password1", "password2", "is_active", "is_staff"),
        }),
    )


# -----------------------
# User Session Admin
# -----------------------
class UserSessionAdmin(admin.ModelAdmin):
    model = UserSession
    list_display = ("id", "user", "session_key", "device", "ip_address", "login_time", "logout_time", "is_active")
    list_filter = ("is_active", "login_time", "logout_time")
    search_fields = ("user__email", "session_key", "device", "ip_address")
    ordering = ("-login_time",)


# Register models
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(UserSession, UserSessionAdmin)
