# withdrawal/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from .models import Withdrawal
from .serializers import WithdrawalRequestSerializer, WithdrawalAdminSerializer
from payments.models import Wallet   # Wallet is in payments app


# -----------------------
# User submits withdrawal request
# -----------------------
class WithdrawalRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = WithdrawalRequestSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            amount = serializer.validated_data["amount"]

            # Prevent zero/negative withdrawals
            if amount <= 0:
                return Response({"error": "Invalid withdrawal amount."}, status=status.HTTP_400_BAD_REQUEST)

            # Prevent multiple pending requests
            if Withdrawal.objects.filter(user=user, status="pending").exists():
                return Response({"error": "You already have a pending withdrawal request."},
                                status=status.HTTP_400_BAD_REQUEST)

            # Check wallet balance
            try:
                wallet = Wallet.objects.get(user=user)
            except Wallet.DoesNotExist:
                return Response({"error": "Wallet not found."}, status=status.HTTP_404_NOT_FOUND)

            if wallet.balance < amount:
                return Response({"error": "Insufficient balance."}, status=status.HTTP_400_BAD_REQUEST)

            # Deduct balance
            wallet.balance -= amount
            wallet.save()

            # Create withdrawal
            withdrawal = serializer.save(user=user, status="pending")

            return Response({
                "message": "Withdrawal request submitted. Please wait up to 48 hours for processing.",
                "withdrawal": WithdrawalRequestSerializer(withdrawal).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -----------------------
# User checks withdrawal history
# -----------------------
class WithdrawalHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        withdrawals = Withdrawal.objects.filter(user=request.user).order_by("-created_at")
        serializer = WithdrawalRequestSerializer(withdrawals, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# -----------------------
# Admin views all pending withdrawals
# -----------------------
class WithdrawalListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        withdrawals = Withdrawal.objects.filter(status="pending").order_by("-created_at")
        serializer = WithdrawalAdminSerializer(withdrawals, many=True)
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
            return Response({"error": "Withdrawal not found or already processed."},
                            status=status.HTTP_404_NOT_FOUND)

        withdrawal.mark_as_paid()
        return Response({"message": "Withdrawal marked as paid."}, status=status.HTTP_200_OK)


# -----------------------
# Admin rejects withdrawal
# -----------------------
class WithdrawalRejectView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, withdrawal_id):
        try:
            withdrawal = Withdrawal.objects.get(id=withdrawal_id, status="pending")
        except Withdrawal.DoesNotExist:
            return Response({"error": "Withdrawal not found or already processed."},
                            status=status.HTTP_404_NOT_FOUND)

        withdrawal.reject()
        return Response({"message": "Withdrawal has been rejected."}, status=status.HTTP_200_OK)
