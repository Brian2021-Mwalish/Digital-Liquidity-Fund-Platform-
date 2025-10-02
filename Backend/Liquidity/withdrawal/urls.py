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
    # Debugging
    path('ping/', ping, name='withdrawal-ping'),

    # User actions
    path('', WithdrawalRequestView.as_view(), name='withdraw-request'),  # POST /api/withdraw/
    path('history/', WithdrawalHistoryView.as_view(), name='withdraw-history'),

    # Admin actions
    path('pending/', WithdrawalListView.as_view(), name='withdraw-pending'),
    path('all/', WithdrawalAllView.as_view(), name='withdraw-all'),
    path('approve/<int:withdrawal_id>/', WithdrawalApproveView.as_view(), name='withdraw-approve'),
    path('paid/<int:withdrawal_id>/', WithdrawalPaidView.as_view(), name='withdraw-paid'),
    path('reject/<int:withdrawal_id>/', WithdrawalRejectView.as_view(), name='withdraw-reject'),
]
