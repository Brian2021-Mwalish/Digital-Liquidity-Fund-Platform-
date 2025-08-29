from django.urls import path
from .views import (
    WithdrawalRequestView,
    WithdrawalHistoryView,
    WithdrawalListView,
    WithdrawalApproveView,
    WithdrawalRejectView,
)

urlpatterns = [
    # User side
    path("withdraw/", WithdrawalRequestView.as_view(), name="withdraw-request"),
    path("withdrawals/history/", WithdrawalHistoryView.as_view(), name="withdrawal-history"),

    # Admin side
    path("admin/withdrawals/", WithdrawalListView.as_view(), name="withdrawal-list"),
    path("admin/withdrawals/<int:withdrawal_id>/approve/", WithdrawalApproveView.as_view(), name="withdrawal-approve"),
    path("admin/withdrawals/<int:withdrawal_id>/reject/", WithdrawalRejectView.as_view(), name="withdrawal-reject"),
]
