# payments/urls.py
from django.urls import path
from .views import (
    GetBalanceView,
    PaymentHistoryView,
    AdminPaymentsOverviewView,
    MpesaPaymentView,
    MpesaCallbackView,
    EarningsView,
)

app_name = "payments"

urlpatterns = [
    # --------------------------- 
    # User wallet endpoints
    # ---------------------------
    path("balance/", GetBalanceView.as_view(), name="get-balance"),
    path("history/", PaymentHistoryView.as_view(), name="payment-history"),
    path("earnings/", EarningsView.as_view(), name="earnings"),

    # ---------------------------
    # Mpesa payment endpoints
    # ---------------------------
    path("mpesa/initiate/", MpesaPaymentView.as_view(), name="mpesa-initiate"),
    path("make/", MpesaPaymentView.as_view(), name="make-payment"),
    path("mpesa/callback/", MpesaCallbackView.as_view(), name="mpesa-callback"),

    # ---------------------------
    # Admin-only endpoint
    # Optional filtering: ?user_id=<id>
    # ---------------------------
    path("admin/overview/", AdminPaymentsOverviewView.as_view(), name="admin-payments-overview"),
]
