# payment/urls.py
from django.urls import path
from .views import StartStkPushView, MpesaCallbackView

urlpatterns = [
    path("payments/stk-push/", StartStkPushView.as_view(), name="stk-push"),
    path("mpesa/stk-push/", MpesaCallbackView.as_view(), name="mpesa-callback"),
]
