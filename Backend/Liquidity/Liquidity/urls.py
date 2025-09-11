# project_root/urls.py
from django.contrib import admin
from django.urls import path, include
from Users.views import ProfileView  # ✅ Ensure correct import (capital 'U')

urlpatterns = [
    # 🔹 Admin
    path("admin/", admin.site.urls),

    # 🔹 Auth & User routes (moved from /api/auth/ → /api/)
    path("api/", include(("Users.urls", "users"), namespace="users")),

    # 🔹 Payments routes
    path("api/payments/", include(("payment.urls", "payment"), namespace="payment")),

    # 🔹 Withdrawals routes (updated to match frontend /api/withdraw/)
    path("api/withdraw/", include(("withdrawal.urls", "withdrawal"), namespace="withdrawal")),

    # 🔹 Direct profile shortcut (frontend can call /api/profile/)
    path("api/profile/", ProfileView.as_view(), name="profile-direct"),
]
