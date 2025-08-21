# payments/urls.py
from django.urls import path
from .views import (
    GetBalanceView,
    MakePaymentView,
    PaymentHistoryView,
    AdminPaymentsOverviewView,
    MpesaPaymentView,
    MpesaCallbackView,
)

urlpatterns = [
    # User wallet endpoints
    path("balance/", GetBalanceView.as_view(), name="get-balance"),
    path("make/", MakePaymentView.as_view(), name="make-payment"),
    path("history/", PaymentHistoryView.as_view(), name="payment-history"),

    # Mpesa payment endpoints
    path("mpesa/initiate/", MpesaPaymentView.as_view(), name="mpesa-initiate"),
    path("mpesa/callback/", MpesaCallbackView.as_view(), name="mpesa-callback"),

    # Admin-only endpoint
    path("admin/overview/", AdminPaymentsOverviewView.as_view(), name="admin-payments-overview"),
]
