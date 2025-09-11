# project_root/urls.py
from django.contrib import admin
from django.urls import path, include
from Users.views import (
    ProfileView,
    ReferralCodeView,
    ReferralHistoryView
)

urlpatterns = [
    # 🔹 Admin
    path("admin/", admin.site.urls),

    # 🔹 Auth & User routes
    path("api/auth/", include(("Users.urls", "users"), namespace="users")),

    # 🔹 Payments routes
    path("api/payments/", include(("payment.urls", "payment"), namespace="payments")),

    # 🔹 Withdrawals routes
    path("api/withdraw/", include(("withdrawal.urls", "withdrawal"), namespace="withdrawal")),

    # 🔹 Direct profile shortcut
    path("api/profile/", ProfileView.as_view(), name="profile-direct"),

    # 🔹 Referrals shortcuts (Option 2)
    path("api/referrals/code/", ReferralCodeView.as_view(), name="referral-code-direct"),
    path("api/referrals/history/", ReferralHistoryView.as_view(), name="referral-history-direct"),
]
