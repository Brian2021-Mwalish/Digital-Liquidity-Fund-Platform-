from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    #  Auth routes (your Users app)
    path('api/auth/', include('Users.urls')),

    # Payments routes (STK Push + Callback)
    path('api/', include('payment.urls')),
]
