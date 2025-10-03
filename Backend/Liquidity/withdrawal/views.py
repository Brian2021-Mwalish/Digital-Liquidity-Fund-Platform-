# withdrawal/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from django.http import JsonResponse
from django.utils import timezone
from .models import Withdrawal
from .serializers import (
    WithdrawalCreateSerializer,
    WithdrawalSerializer,
)
from payment.models import Wallet


# -----------------------
# Debugging helper
# -----------------------
def ping(request):
    return JsonResponse({"message": "withdrawal urls are working ✅"})


# -----------------------
# User submits withdrawal request
# -----------------------
class WithdrawalRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = WithdrawalCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            amount = serializer.validated_data["amount"]

            if amount <= 0:
                return Response(
                    {"error": "Invalid withdrawal amount."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Prevent multiple pending
            if Withdrawal.objects.filter(user=user, status="pending").exists():
                return Response(
                    {"error": "You already have a pending withdrawal request."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                wallet = Wallet.objects.get(user=user)
            except Wallet.DoesNotExist:
                return Response(
                    {"error": "Wallet not found."}, status=status.HTTP_404_NOT_FOUND
                )

            if wallet.balance < amount:
                return Response(
                    {"error": "Insufficient balance."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Deduct immediately (reserve funds)
            wallet.balance -= amount
            wallet.save()

            withdrawal = serializer.save(user=user, status="pending")

            return Response(
                {
                    "message": "Withdrawal request submitted. Awaiting admin approval.",
                    "withdrawal": WithdrawalSerializer(withdrawal).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -----------------------
# User checks withdrawal history
# -----------------------
class WithdrawalHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        withdrawals = Withdrawal.objects.filter(user=request.user).order_by(
            "-created_at"
        )
        serializer = WithdrawalSerializer(withdrawals, many=True)
        return Response(serializer.data)


# -----------------------
# Admin: view pending withdrawals
# -----------------------
class WithdrawalListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        withdrawals = Withdrawal.objects.filter(status="pending").order_by(
            "-created_at"
        )
        serializer = WithdrawalSerializer(withdrawals, many=True)
        return Response(serializer.data)


# -----------------------
# Admin: view all withdrawals
# -----------------------
class WithdrawalAllView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        withdrawals = Withdrawal.objects.all().order_by("-created_at")
        serializer = WithdrawalSerializer(withdrawals, many=True)
        return Response(serializer.data)


# -----------------------
# Admin approves withdrawal
# -----------------------
class WithdrawalApproveView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, withdrawal_id):
        try:
            withdrawal = Withdrawal.objects.get(id=withdrawal_id, status="pending")
        except Withdrawal.DoesNotExist:
            return Response(
                {"error": "Withdrawal not found or already processed."},
                status=status.HTTP_404_NOT_FOUND,
            )

        withdrawal.status = "approved"
        withdrawal.processed_at = timezone.now()
        withdrawal.save(update_fields=["status", "processed_at"])
        return Response({"message": "Withdrawal approved."})


# -----------------------
# Admin marks as Paid
# -----------------------
class WithdrawalPaidView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, withdrawal_id):
        try:
            withdrawal = Withdrawal.objects.get(
                id=withdrawal_id, status__in=["pending", "approved"]
            )
        except Withdrawal.DoesNotExist:
            return Response(
                {"error": "Withdrawal not found or already processed."},
                status=status.HTTP_404_NOT_FOUND,
            )

        withdrawal.status = "paid"
        withdrawal.processed_at = timezone.now()
        withdrawal.save(update_fields=["status", "processed_at"])
        return Response({"message": "Withdrawal marked as paid."})


# -----------------------
# Admin rejects withdrawal
# -----------------------
class WithdrawalRejectView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, withdrawal_id):
        try:
            withdrawal = Withdrawal.objects.get(id=withdrawal_id, status="pending")
        except Withdrawal.DoesNotExist:
            return Response(
                {"error": "Withdrawal not found or already processed."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Refund back
        wallet = Wallet.objects.get(user=withdrawal.user)
        wallet.balance += withdrawal.amount
        wallet.save()

        withdrawal.status = "rejected"
        withdrawal.processed_at = timezone.now()
        withdrawal.save(update_fields=["status", "processed_at"])

        return Response(
            {"message": "Withdrawal rejected. Funds refunded to wallet."}
        )


# -----------------------
# ViewSet for CRUD (not used in frontend but useful for DRF Browsable API)
# -----------------------
class WithdrawalViewSet(viewsets.ModelViewSet):
    queryset = Withdrawal.objects.all().order_by("-created_at")
    serializer_class = WithdrawalSerializer
    permission_classes = [permissions.IsAdminUser]
