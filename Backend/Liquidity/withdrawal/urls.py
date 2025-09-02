from django.urls import path
from .views import (
    ping,
    WithdrawalRequestView,
    WithdrawalHistoryView,
    WithdrawalListView,
    WithdrawalApproveView,
    WithdrawalRejectView,
)

urlpatterns = [
    # Debugging
    path('ping/', ping, name='withdrawal-ping'),

    # User actions
    path('', WithdrawalRequestView.as_view(), name='withdraw-request'),  # POST /api/withdraw/
    path('history/', WithdrawalHistoryView.as_view(), name='withdraw-history'),

    # Admin actions
    path('pending/', WithdrawalListView.as_view(), name='withdraw-pending'),
    path('approve/<int:withdrawal_id>/', WithdrawalApproveView.as_view(), name='withdraw-approve'),
    path('reject/<int:withdrawal_id>/', WithdrawalRejectView.as_view(), name='withdraw-reject'),
]
