from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db.models import Sum

from .models import Rental


class PendingReturnsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Returns the sum of expected_return for all active rentals of the authenticated user.
        """
        total_pending_returns = Rental.objects.filter(
            user=request.user,
            status="active"
        ).aggregate(total=Sum("expected_return"))["total"] or 0

        return Response({"pending_returns": float(total_pending_returns)}, status=status.HTTP_200_OK)
