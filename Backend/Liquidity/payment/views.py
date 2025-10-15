# payments/views.py
import requests
import json
import logging
import base64
from decimal import Decimal
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
from django.http import JsonResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils import timezone

from .models import Payment, Wallet
from .serializers import PaymentSerializer
from Users.models import Referral
from rentals.models import Rental

logger = logging.getLogger(__name__)
User = get_user_model()

# --- Currency Deduction Rules (amounts in KES) ---
CURRENCY_COSTS = {
    "CAD": 100,
    "AUD": 250,
    "GBP": 500,
    "JPY": 750,
    "EUR": 1000,
    "USD": 1200,
}


# ---------------------------#
# Helper: Normalize phone number
# ---------------------------#
def normalize_phone(phone):
    """
    Convert Kenyan phone numbers to international format.
    - 07XXXXXXXX -> 2547XXXXXXXX
    - 7XXXXXXXX  -> 2547XXXXXXXX
    - 2547XXXXXXXX -> unchanged
    """
    phone = phone.strip()
    if phone.startswith("0"):
        return "254" + phone[1:]
    elif phone.startswith("7"):
        return "254" + phone
    elif phone.startswith("254"):
        return phone
    raise ValueError("Invalid phone number format")


# ---------------------------#
# Helper: Get M-PESA Access Token
# ---------------------------#
def get_mpesa_access_token():
    """Fetch OAuth token from M-PESA API."""
    url = f"{settings.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials"
    headers = {"Authorization": f"Basic {settings.MPESA_BASE64_ENCODED_CREDENTIALS}"}

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        token_data = response.json()
        return token_data.get("access_token")
    except requests.RequestException as e:
        logger.error(f"M-PESA token request failed: {e}")
        return None


# ---------------------------#
# 1. Get Wallet Balance (GET)
# ---------------------------#
class GetBalanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        return Response({"balance": wallet.balance}, status=status.HTTP_200_OK)


# ---------------------------#
# 2. Initiate Mpesa STK Push
# ---------------------------#
class MpesaPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        card_currency = request.data.get("currency")
        phone = request.data.get("phone")

        if not card_currency:
            return Response({"error": "Currency required"}, status=400)

        if card_currency not in CURRENCY_COSTS:
            return Response({"error": "Unsupported currency"}, status=400)

        amount = CURRENCY_COSTS[card_currency]

        if phone:
            # M-Pesa initiation
            try:
                phone = normalize_phone(phone)
            except ValueError:
                return Response({"error": "Invalid phone number format"}, status=400)

            # Validate callback URL
            if not settings.MPESA_CALLBACK_URL:
                logger.error("MPESA_CALLBACK_URL not set")
                return Response({"error": "M-PESA callback URL not configured"}, status=500)

            # Get M-PESA access token
            access_token = get_mpesa_access_token()
            if not access_token:
                return Response({"error": "Failed to retrieve M-PESA access token"}, status=500)

            # Generate current timestamp and password
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            password = base64.b64encode(f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}".encode()).decode()

            # Log environment and payload
            logger.info(f"M-PESA Environment: {settings.MPESA_ENV}, Base URL: {settings.MPESA_BASE_URL}")

            # Prepare STK Push
            stk_url = f"{settings.MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest"
            headers = {"Authorization": f"Bearer {access_token}"}
            payload = {
                "BusinessShortCode": settings.MPESA_SHORTCODE,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": phone,
                "PartyB": settings.MPESA_SHORTCODE,
                "PhoneNumber": phone,
                "CallBackURL": settings.MPESA_CALLBACK_URL,
                "AccountReference": card_currency,
                "TransactionDesc": f"Wallet top-up via {card_currency}",
            }

            try:
                response = requests.post(stk_url, json=payload, headers=headers, timeout=10)
                data = response.json()
                logger.info(f"STK Push initiated for {phone}: {json.dumps(data)}")
                return Response(data, status=response.status_code)
            except requests.RequestException as e:
                logger.error(f"STK Push request failed: {e}")
                return Response({"error": "Failed to send STK Push request"}, status=500)
            except Exception as e:
                logger.exception("Unexpected error in STK Push")
                return Response({"error": str(e)}, status=500)
        else:
            # Deduct for currency rental
            wallet, _ = Wallet.objects.get_or_create(user=request.user)
            wallet.balance -= Decimal(str(amount))
            wallet.save(update_fields=["balance"])

            Payment.objects.create(
                user=request.user,
                currency=card_currency,
                amount_deducted=amount,
                status="completed",
            )

            Rental.objects.create(
                user=request.user,
                currency=card_currency,
                amount=amount,
                expected_return=amount * 2,
                status="active",
                duration_days=20,
            )

            return Response({"new_balance": float(wallet.balance)}, status=status.HTTP_200_OK)


# ---------------------------#
# 3. M-PESA Callback (POST)
# ---------------------------#
@method_decorator(csrf_exempt, name="dispatch")
class MpesaCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            data = request.data
            logger.info("📥 M-PESA Callback: %s", json.dumps(data, indent=2))

            stk_callback = data.get("Body", {}).get("stkCallback", {})
            result_code = stk_callback.get("ResultCode")

            if result_code != 0:
                return JsonResponse({"ResultCode": 0, "ResultDesc": "Transaction failed or cancelled"})

            metadata = stk_callback.get("CallbackMetadata", {})
            amount, phone = None, None

            for item in metadata.get("Item", []):
                if item["Name"] == "Amount":
                    amount = item["Value"]
                elif item["Name"] == "PhoneNumber":
                    phone = str(item["Value"])

            if not (amount and phone):
                return JsonResponse({"ResultCode": 1, "ResultDesc": "Missing Amount or PhoneNumber"})

            # Update user wallet
            user = User.objects.filter(phone_number=phone).first()
            if not user:
                logger.warning(f"User not found for phone {phone}")
                return JsonResponse({"ResultCode": 0, "ResultDesc": "User not found"})

            wallet, _ = Wallet.objects.get_or_create(user=user)
            wallet.balance += amount
            wallet.save(update_fields=["balance"])

            Payment.objects.create(
                user=user,
                currency="KES",
                amount_deducted=amount,
                status="completed",
            )

            Rental.objects.create(
                user=user,
                currency="KES",
                amount=amount,
                expected_return=amount * 2,
                status="active",
                duration_days=20,
            )

            # Optional: Referral reward (if user was referred)
            if getattr(user, "referred_by", None):
                reward = amount / 2
                ref_wallet, _ = Wallet.objects.get_or_create(user=user.referred_by)
                ref_wallet.balance += reward
                ref_wallet.save(update_fields=["balance"])

                Referral.objects.update_or_create(
                    referrer=user.referred_by,
                    referred=user,
                    defaults={"reward": reward},
                )

            return JsonResponse({"ResultCode": 0, "ResultDesc": "Callback processed successfully"})

        except Exception as e:
            logger.exception("Error processing M-PESA callback")
            return JsonResponse({"ResultCode": 1, "ResultDesc": f"Error: {str(e)}"})


# ---------------------------#
# 4. User Payment History (GET)
# ---------------------------#
class PaymentHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        payments = Payment.objects.filter(user=request.user).order_by("-created_at")
        serializer = PaymentSerializer(payments, many=True)
        return Response({"payments": serializer.data}, status=200)


# ---------------------------#
# 5. Admin Payments Overview (GET)
# ---------------------------#
class AdminPaymentsOverviewView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        user_id = request.query_params.get("user_id")
        payments = Payment.objects.filter(user_id=user_id) if user_id else Payment.objects.all()
        payments = payments.order_by("-created_at")

        serializer = PaymentSerializer(payments, many=True)
        total_amount = payments.aggregate(total=Sum("amount_deducted"))["total"] or 0

        return Response(
            {
                "payments": serializer.data,
                "totals_by_currency": {"KES": total_amount},
                "grand_total": total_amount,
            },
            status=200,
        )


# ---------------------------#
# 6. User Earnings (GET) - Total earnings this month from completed payments
# ---------------------------#
class EarningsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        total_earnings = Payment.objects.filter(
            user=request.user,
            status="completed",
            created_at__year=now.year,
            created_at__month=now.month
        ).aggregate(total=Sum("amount_deducted"))["total"] or 0

        return Response({"total_earnings": float(total_earnings)}, status=status.HTTP_200_OK)
