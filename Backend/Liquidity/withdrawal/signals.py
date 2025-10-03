# withdrawal/signals.py
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Withdrawal
from payment.models import Wallet


# -----------------------
# Handle status changes
# -----------------------
@receiver(pre_save, sender=Withdrawal)
def handle_withdrawal_status_change(sender, instance, **kwargs):
    """
    Automatically manage wallet adjustments when withdrawal status changes.
    """
    if not instance.pk:
        # New withdrawal being created -> handled in views (deduct balance on request)
        return

    try:
        prev = Withdrawal.objects.get(pk=instance.pk)
    except Withdrawal.DoesNotExist:
        return

    # Track status change
    old_status = prev.status
    new_status = instance.status

    # Only act if status changed
    if old_status == new_status:
        return

    wallet = Wallet.objects.get(user=instance.user)

    # -----------------------
    # Rejected → refund wallet
    # -----------------------
    if new_status == "rejected":
        wallet.balance += instance.amount
        wallet.save()
        instance.processed_at = timezone.now()

    # -----------------------
    # Paid → confirm timestamp
    # -----------------------
    elif new_status == "paid":
        # By this point funds were already deducted on request
        # Just update timestamp
        instance.processed_at = timezone.now()

    # -----------------------
    # Approved → just timestamp
    # -----------------------
    elif new_status == "approved":
        instance.processed_at = timezone.now()


# -----------------------
# Extra safety: prevent multiple pending withdrawals per user
# -----------------------
@receiver(pre_save, sender=Withdrawal)
def prevent_multiple_pending(sender, instance, **kwargs):
    if instance.status == "pending":
        # If this is a new withdrawal
        if not instance.pk:
            if Withdrawal.objects.filter(user=instance.user, status="pending").exists():
                raise ValidationError("You already have a pending withdrawal request.")
