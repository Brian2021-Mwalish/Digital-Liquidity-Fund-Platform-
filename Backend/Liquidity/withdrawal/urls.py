from django.urls import path
from .views import (
    WithdrawalRequestView,
    WithdrawalHistoryView,
    WithdrawalListView,
    WithdrawalApproveView,
    WithdrawalRejectView,
    ping,  # add this
)

urlpatterns = [
    path("ping/", ping, name="withdrawal-ping"),  # <-- test route

    path("withdraw/", WithdrawalRequestView.as_view(), name="withdraw-alias"),
    path("withdrawals/request/", WithdrawalRequestView.as_view(), name="withdraw-request"),
    path("withdrawals/history/", WithdrawalHistoryView.as_view(), name="withdrawal-history"),

    path("withdrawals/", WithdrawalListView.as_view(), name="withdrawal-list"),
    path("withdrawals/<int:withdrawal_id>/approve/", WithdrawalApproveView.as_view(), name="withdrawal-approve"),
    path("withdrawals/<int:withdrawal_id>/reject/", WithdrawalRejectView.as_view(), name="withdrawal-reject"),
]
