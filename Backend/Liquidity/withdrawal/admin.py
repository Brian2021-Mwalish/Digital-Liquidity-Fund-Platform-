# payments/admin.py
from django.contrib import admin
from .models import Withdrawal


@admin.register(Withdrawal)
class WithdrawalAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "mobile_number", "amount", "status", "created_at", "processed_at")
    list_filter = ("status", "created_at")
    search_fields = ("user__email", "mobile_number")
    ordering = ("-created_at",)
    actions = ["mark_as_paid", "reject_withdrawal"]

    # ✅ Custom Action - Mark as Paid
    def mark_as_paid(self, request, queryset):
        updated = queryset.filter(status="pending").update(status="paid")
        self.message_user(request, f"{updated} withdrawal(s) marked as Paid.")

    mark_as_paid.short_description = "Mark selected withdrawals as Paid"

    # ✅ Custom Action - Reject Withdrawal
    def reject_withdrawal(self, request, queryset):
        updated = queryset.filter(status="pending").update(status="rejected")
        self.message_user(request, f"{updated} withdrawal(s) Rejected.")

    reject_withdrawal.short_description = "Reject selected withdrawals"
