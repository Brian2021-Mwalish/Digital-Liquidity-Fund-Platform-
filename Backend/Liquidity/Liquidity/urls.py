# project_root/urls.py
from django.contrib import admin
from django.urls import path, include
from Users.views import ProfileView  # ✅ Ensure correct import (capital 'U')

urlpatterns = [
    # 🔹 Admin
    path("admin/", admin.site.urls),

    # 🔹 Auth & User routes
    path("api/auth/", include(("Users.urls", "users"), namespace="users")),  # matches your Users app

    # 🔹 Payments routes
    path("api/payments/", include(("payment.urls", "payment"), namespace="payments")),

    # 🔹 Withdrawals routes (updated to match frontend /api/withdraw/)
    path("api/withdraw/", include(("withdrawal.urls", "withdrawal"), namespace="withdrawal")),

    # 🔹 Direct profile shortcut (frontend can call /api/profile/)
    path("api/profile/", ProfileView.as_view(), name="profile-direct"),
]
