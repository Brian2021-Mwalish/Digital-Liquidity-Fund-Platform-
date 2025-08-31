from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # 🔹 Auth routes (/api/auth/...)
    path('api/auth/', include('Users.urls')),

    # 🔹 User management routes (/api/users/...) for AdminDashboard
    path('api/', include('Users.urls')),  # ensures /api/users/ exists

    # 🔹 Payments routes
    path('api/payments/', include(('payment.urls', 'payment'), namespace='payments')),

    # 🔹 Withdrawals routes
    path('api/', include('withdrawal.urls')),  # no namespace
]
