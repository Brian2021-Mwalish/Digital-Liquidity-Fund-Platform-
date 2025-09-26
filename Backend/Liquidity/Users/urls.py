# users/urls.py
from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    GoogleLoginView,
    ProfileView,
    SessionListView,
    ForgotPasswordView,
    ResetPasswordView,
    UserListView,
    BlockUserView,
    UnblockUserView,
    KYCProfileDetailView,
    ReferralListView,
    ReferralAdminView,
    ReferralCodeView,       # ✅ added
    ReferralHistoryView,    # ✅ added
    admin_award_wallet,     # Admin wallet award endpoint
)
from .models import KYCListView

urlpatterns = [
    # Auth
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("google-login/", GoogleLoginView.as_view(), name="google-login"),

    # Profile & Sessions
    path("profile/", ProfileView.as_view(), name="profile"),
    path("sessions/", SessionListView.as_view(), name="sessions"),

    # Password reset
    path("forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("reset-password/<uidb64>/<token>/", ResetPasswordView.as_view(), name="reset-password"),

    # Admin User Management
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<int:user_id>/block/", BlockUserView.as_view(), name="block-user"),
    path("users/<int:user_id>/unblock/", UnblockUserView.as_view(), name="unblock-user"),
    path("users/<int:user_id>/award-wallet/", admin_award_wallet, name="admin-award-wallet"),  # Admin wallet award endpoint

    # KYC
    path("kyc/", KYCProfileDetailView.as_view(), name="kyc-profile"),  # ✅ now available at /api/kyc/
    path('kyc/all/', KYCListView.as_view(), name='kyc-list'),

    # Referrals
    path("referrals/", ReferralListView.as_view(), name="referral-list"),
    path("referrals/code/", ReferralCodeView.as_view(), name="referral-code"),          # ✅ added
    path("referrals/history/", ReferralHistoryView.as_view(), name="referral-history"), # ✅ added
    path("referrals/admin/", ReferralAdminView.as_view(), name="referral-admin"),
]
