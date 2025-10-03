# withdrawal/admin.py
from django.contrib import admin
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.contrib import messages
from .models import Withdrawal
from payment.models import Wallet


@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "mobile_number",
        "amount",
        "status",
        "created_at",
        "processed_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("user__email", "mobile_number")
    ordering = ("-created_at",)
    actions = ["approve_withdrawal", "mark_as_paid", "reject_withdrawal"]

    # -----------------------
    # ✅ Custom Action - Approve
    # -----------------------
    def approve_withdrawal(self, request, queryset):
        updated = 0
        for withdrawal in queryset.filter(status="pending"):
            try:
                withdrawal.approve()
                updated += 1
            except ValidationError as e:
                self.message_user(request, f"Error approving withdrawal {withdrawal.id}: {e}", level=messages.ERROR)
        self.message_user(request, f"{updated} withdrawal(s) approved.")

    approve_withdrawal.short_description = "Approve selected withdrawals"

    # -----------------------
    # ✅ Custom Action - Mark as Paid
    # -----------------------
    def mark_as_paid(self, request, queryset):
        updated = 0
        for withdrawal in queryset.filter(status__in=["pending", "approved", "processing"]):
            try:
                withdrawal.mark_as_paid()
                updated += 1
            except ValidationError as e:
                self.message_user(request, f"Error marking withdrawal {withdrawal.id} as paid: {e}", level=messages.ERROR)
        self.message_user(request, f"{updated} withdrawal(s) marked as Paid.")

    mark_as_paid.short_description = "Mark selected withdrawals as Paid"

    # -----------------------
    # ✅ Custom Action - Reject Withdrawal
    # -----------------------
    def reject_withdrawal(self, request, queryset):
        updated = 0
        for withdrawal in queryset.filter(status="pending"):
            try:
                # Refund wallet on reject
                wallet = Wallet.objects.get(user=withdrawal.user)
                wallet.balance += withdrawal.amount
                wallet.save()
                withdrawal.reject()
                updated += 1
            except (ValidationError, Wallet.DoesNotExist) as e:
                self.message_user(request, f"Error rejecting withdrawal {withdrawal.id}: {e}", level=messages.ERROR)
        self.message_user(request, f"{updated} withdrawal(s) Rejected and refunded.")

    reject_withdrawal.short_description = "Reject selected withdrawals"
