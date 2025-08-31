# payments/urls.py
from django.urls import path
from .views import (
    GetBalanceView,
    PaymentHistoryView,
    AdminPaymentsOverviewView,
    MpesaPaymentView,
    MpesaCallbackView,
)

app_name = "payments"

urlpatterns = [
    # ---------------------------
    # User wallet endpoints
    # ---------------------------
    path("balance/", GetBalanceView.as_view(), name="get-balance"),
    path("history/", PaymentHistoryView.as_view(), name="payment-history"),

    # ---------------------------
    # Mpesa payment endpoints
    # ---------------------------
    path("mpesa/initiate/", MpesaPaymentView.as_view(), name="mpesa-initiate"),
    path("mpesa/callback/", MpesaCallbackView.as_view(), name="mpesa-callback"),

    # ---------------------------
    # Admin-only endpoint
    # Optional filtering: ?user_id=<id>
    # ---------------------------
    path("admin/overview/", AdminPaymentsOverviewView.as_view(), name="admin-payments-overview"),
]
