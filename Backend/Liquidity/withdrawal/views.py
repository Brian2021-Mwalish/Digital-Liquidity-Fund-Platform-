# withdrawal/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.http import JsonResponse
from .models import Withdrawal
from .serializers import (
    WithdrawalCreateSerializer,
    WithdrawalSerializer,
    WithdrawalStatusUpdateSerializer,
)
from payment.models import Wallet


# -----------------------
# Debugging helper - confirm URLs are working
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

            # Prevent zero/negative withdrawals
            if amount <= 0:
                return Response(
                    {"error": "Invalid withdrawal amount."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Prevent multiple pending requests
            if Withdrawal.objects.filter(user=user, status="pending").exists():
                return Response(
                    {"error": "You already have a pending withdrawal request."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Check wallet balance
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

            # Deduct balance immediately (reserve funds)
            wallet.balance -= amount
            wallet.save()

            # Create withdrawal request
            withdrawal = serializer.save(user=user, status="pending")

            return Response(
                {
                    "message": "Withdrawal request submitted. Please wait up to 48 hours for processing.",
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
        return Response(serializer.data, status=status.HTTP_200_OK)


# -----------------------
# Admin views all pending withdrawals
# -----------------------
class WithdrawalListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        withdrawals = Withdrawal.objects.filter(status="pending").order_by(
            "-created_at"
        )
        serializer = WithdrawalSerializer(withdrawals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# -----------------------
# Admin marks withdrawal as Paid
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

        # Double-check wallet (safety net)
        wallet = Wallet.objects.get(user=withdrawal.user)
        if wallet.balance < 0:
            return Response(
                {"error": "Wallet balance mismatch."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        withdrawal.mark_as_paid()
        return Response(
            {"message": "Withdrawal marked as paid."}, status=status.HTTP_200_OK
        )


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

        # Refund back to wallet when rejected
        wallet = Wallet.objects.get(user=withdrawal.user)
        wallet.balance += withdrawal.amount
        wallet.save()

        withdrawal.reject()
        return Response(
            {"message": "Withdrawal has been rejected, funds refunded to wallet."},
            status=status.HTTP_200_OK,
        )
