# withdrawal/urls.py
from django.urls import path
from .views import (
    ping,
    WithdrawalRequestView,
    WithdrawalHistoryView,
    WithdrawalListView,
    WithdrawalAllView,
    WithdrawalApproveView,
    WithdrawalPaidView,
    WithdrawalRejectView,
)

urlpatterns = [
    # Debugging / Health check
    path("ping/", ping, name="withdrawal-ping"),

    # -----------------------
    # User actions
    # -----------------------
    path("", WithdrawalRequestView.as_view(), name="withdraw-request"),  
    # POST   /api/withdraw/        -> Submit withdrawal
    path("history/", WithdrawalHistoryView.as_view(), name="withdraw-history"),  
    # GET    /api/withdraw/history/ -> User withdrawal history

    # -----------------------
    # Admin actions
    # -----------------------
    path("pending/", WithdrawalListView.as_view(), name="withdraw-pending"),  
    # GET    /api/withdraw/pending/ -> List pending withdrawals
    path("all/", WithdrawalAllView.as_view(), name="withdraw-all"),  
    # GET    /api/withdraw/all/     -> List all withdrawals (any status)

    path("approve/<int:withdrawal_id>/", WithdrawalApproveView.as_view(), name="withdraw-approve"),  
    # POST   /api/withdraw/approve/<id>/ -> Approve withdrawal
    path("paid/<int:withdrawal_id>/", WithdrawalPaidView.as_view(), name="withdraw-paid"),  
    # POST   /api/withdraw/paid/<id>/    -> Mark withdrawal as paid
    path("reject/<int:withdrawal_id>/", WithdrawalRejectView.as_view(), name="withdraw-reject"),  
    # POST   /api/withdraw/reject/<id>/  -> Reject & refund withdrawal
]
