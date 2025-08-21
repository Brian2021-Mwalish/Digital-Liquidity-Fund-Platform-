# payments/views.py
import requests
import json
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.conf import settings
from django.http import JsonResponse

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import get_user_model
from django.db.models import Sum

from .models import Payment
from .serializers import PaymentSerializer

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

# ---------------------------
# 1. Get Balance (GET)
# ---------------------------
class GetBalanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"balance": request.user.balance}, status=status.HTTP_200_OK)


# ---------------------------
# 2. Wallet Payment (POST)
# ---------------------------
class MakePaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            card_currency = request.data.get("currency")  # e.g., USD, GBP

            if not card_currency or card_currency not in CURRENCY_COSTS:
                return Response(
                    {"error": "Unsupported or missing currency"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            deduction = CURRENCY_COSTS[card_currency]

            if user.balance < deduction:
                return Response(
                    {"error": "Insufficient balance"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.balance -= deduction
            user.save(update_fields=["balance"])

            payment = Payment.objects.create(
                user=user,
                currency="KES",
                amount_deducted=deduction,
                status="completed",
            )

            return Response(
                {
                    "message": f"Payment successful (Card: {card_currency}, Deducted: {deduction} KES)",
                    "payment": PaymentSerializer(payment).data,
                    "new_balance": user.balance,
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------
# 3. Initiate Mpesa STK Push
# ---------------------------
class MpesaPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            phone = request.data.get("phone")
            card_currency = request.data.get("currency")

            if not phone or not card_currency:
                return Response({"error": "Phone and currency required"}, status=400)

            if card_currency not in CURRENCY_COSTS:
                return Response({"error": "Unsupported currency"}, status=400)

            amount = CURRENCY_COSTS[card_currency]

            # Request token
            token_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
            token_headers = {
                "Authorization": "Basic " + settings.MPESA_BASE64_ENCODED_CREDENTIALS
            }
            token_res = requests.get(token_url, headers=token_headers, timeout=10)
            if token_res.status_code != 200:
                return Response({"error": "Failed to get Mpesa token"}, status=500)

            access_token = token_res.json().get("access_token")
            if not access_token:
                return Response({"error": "Invalid Mpesa token response"}, status=500)

            # STK Push
            stk_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
            stk_headers = {"Authorization": f"Bearer {access_token}"}
            payload = {
                "BusinessShortCode": settings.MPESA_SHORTCODE,
                "Password": settings.MPESA_PASSWORD,
                "Timestamp": settings.MPESA_TIMESTAMP,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": phone,
                "PartyB": settings.MPESA_SHORTCODE,
                "PhoneNumber": phone,
                "CallBackURL": settings.MPESA_CALLBACK_URL,
                "AccountReference": card_currency,
                "TransactionDesc": f"Wallet Topup via {card_currency} card",
            }

            res = requests.post(stk_url, json=payload, headers=stk_headers, timeout=10)
            try:
                res_data = res.json()
            except ValueError:
                res_data = {"error": "Invalid response from Mpesa STK Push"}

            return Response(res_data, status=res.status_code if res_data else 500)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ---------------------------
# 4. Mpesa Callback
# ---------------------------
@method_decorator(csrf_exempt, name="dispatch")
class MpesaCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            data = request.data
            print("📥 Mpesa Callback:", json.dumps(data, indent=2))

            result_code = data.get("Body", {}).get("stkCallback", {}).get("ResultCode")
            metadata = data.get("Body", {}).get("stkCallback", {}).get("CallbackMetadata", {})

            if result_code == 0:
                amount = None
                phone = None
                for item in metadata.get("Item", []):
                    if item["Name"] == "Amount":
                        amount = item["Value"]
                    if item["Name"] == "PhoneNumber":
                        phone = item["Value"]

                if amount and phone:
                    try:
                        user = User.objects.get(phone_number=phone)
                        user.balance += amount
                        user.save(update_fields=["balance"])

                        Payment.objects.create(
                            user=user,
                            currency="KES",
                            amount_deducted=amount,
                            status="completed",
                        )
                    except User.DoesNotExist:
                        print("⚠️ Mpesa Callback: User not found for phone", phone)

            return JsonResponse({"ResultCode": 0, "ResultDesc": "Received"})
        except Exception as e:
            return JsonResponse({"ResultCode": 1, "ResultDesc": f"Error: {str(e)}"})


# ---------------------------
# 5. Payment History (GET)
# ---------------------------
class PaymentHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        payments = Payment.objects.filter(user=request.user).order_by("-created_at")
        serializer = PaymentSerializer(payments, many=True)
        return Response({"payments": serializer.data}, status=status.HTTP_200_OK)


# ---------------------------
# 6. Admin Payments Overview (GET all)
# ---------------------------
class AdminPaymentsOverviewView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            user_id = request.query_params.get("user_id")
            if user_id:
                payments = Payment.objects.filter(user_id=user_id).order_by("-created_at")
            else:
                payments = Payment.objects.all().order_by("-created_at")

            serializer = PaymentSerializer(payments, many=True)

            totals = {
                "KES": payments.aggregate(total=Sum("amount_deducted"))["total"] or 0
            }

            return Response(
                {
                    "payments": serializer.data,
                    "totals_by_currency": totals,
                    "grand_total": totals["KES"],
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
