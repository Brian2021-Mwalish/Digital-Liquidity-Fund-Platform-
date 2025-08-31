from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth routes
    path('api/auth/', include('Users.urls')),

    # Payments routes
    path('api/payments/', include(('payment.urls', 'payment'), namespace='payments')),

    # Withdrawals routes
    path('api/', include('withdrawal.urls')),  # removed namespace for simplicity
]
