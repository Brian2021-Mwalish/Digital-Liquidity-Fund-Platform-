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


class UserRentalsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Returns all rentals for the authenticated user with full details.
        """
        rentals = Rental.objects.filter(user=request.user).order_by("-created_at")
        rental_data = []
        for rental in rentals:
            rental_data.append({
                "id": rental.id,
                "unique_id": str(rental.unique_id),
                "currency": rental.currency,
                "amount": float(rental.amount),
                "expected_return": float(rental.expected_return),
                "status": rental.status,
                "duration_days": rental.duration_days,
                "created_at": rental.created_at.isoformat(),
                "end_date": rental.end_date.isoformat() if rental.end_date else None,
            })

        return Response({"rentals": rental_data}, status=status.HTTP_200_OK)
