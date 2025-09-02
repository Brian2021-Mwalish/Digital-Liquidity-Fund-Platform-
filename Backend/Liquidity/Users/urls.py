# users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView, GoogleLoginView,
    ProfileView, SessionListView, ForgotPasswordView, ResetPasswordView,
    UserListView, BlockUserView, UnblockUserView, KYCProfileDetailView,
)

app_name = "users"

urlpatterns = [
    # -----------------------
    # Registration
    # -----------------------
    path("register/", RegisterView.as_view(), name="register"),

    # -----------------------
    # JWT Auth
    # -----------------------
    path("login/", TokenObtainPairView.as_view(), name="jwt_login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("custom-login/", LoginView.as_view(), name="custom_login"),

    # -----------------------
    # Logout & Social
    # -----------------------
    path("logout/", LogoutView.as_view(), name="logout"),
    path("google-login/", GoogleLoginView.as_view(), name="google_login"),

    # -----------------------
    # User profile & sessions
    # -----------------------
    path("profile/", ProfileView.as_view(), name="profile"),        # /api/users/profile/
    path("sessions/", SessionListView.as_view(), name="sessions"),

    # -----------------------
    # Password management
    # -----------------------
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot_password"),
    path("reset-password/<uidb64>/<token>/", ResetPasswordView.as_view(), name="reset_password"),

    # -----------------------
    # Admin User Management
    # -----------------------
    path("users/", UserListView.as_view(), name="user_list"),      # /api/users/users/
    path("users/<int:user_id>/block/", BlockUserView.as_view(), name="block_user"),
    path("users/<int:user_id>/unblock/", UnblockUserView.as_view(), name="unblock_user"),

    # -----------------------
    # KYC routes
    # -----------------------
    path("kyc/", KYCProfileDetailView.as_view(), name="kyc_profile"),

    # -----------------------
    # Default route to profile (optional)
    # -----------------------
    path("", ProfileView.as_view(), name="profile_direct"),
]
