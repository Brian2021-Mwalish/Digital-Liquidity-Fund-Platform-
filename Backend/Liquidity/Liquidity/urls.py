from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth routes
    path('api/auth/', include('Users.urls')),

    # Payments routes with /payments/ prefix
    path('api/payments/', include('payment.urls', namespace='payments')),
]
