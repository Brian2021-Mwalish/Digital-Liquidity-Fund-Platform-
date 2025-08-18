# payment/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction as dbtx
from django.shortcuts import get_object_or_404

from .models import MpesaPayment, CurrencyProduct
from .serializers import StartStkPushSerializer
from .mpesa import MpesaClient


class StartStkPushView(APIView):
    """
    Initiates an STK Push request.
    User only sends phone_number + currency_code.
    Amount is fixed by backend.
    """
    permission_classes = [permissions.IsAuthenticated]

    @dbtx.atomic
    def post(self, request):
        serializer = StartStkPushSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone_number"]
        code = serializer.validated_data["currency_code"]

        # lookup fixed amount
        product = get_object_or_404(CurrencyProduct, code=code, active=True)
        amount = int(product.price_kes)

        # create payment record
        payment = MpesaPayment.objects.create(
            user=request.user,
            phone_number=phone,
            currency=product,
            amount=amount,
        )

        # call Safaricom
        client = MpesaClient()
        response = client.stk_push(phone_e164=phone, amount=amount, account_ref=code)

        # save Safaricom response
        payment.merchant_request_id = response.get("MerchantRequestID", "")
        payment.checkout_request_id = response.get("CheckoutRequestID", "")
        payment.raw_callback = response
        payment.save()

        return Response({
            "message": f"STK push of {amount} KES sent for {code}. Check your phone.",
            "checkout_request_id": payment.checkout_request_id,
            "amount": amount,
            "currency": code
        }, status=status.HTTP_201_CREATED)


class MpesaCallbackView(APIView):
    """
    Handles callback from Safaricom.
    """
    permission_classes = [permissions.AllowAny]

    @dbtx.atomic
    def post(self, request):
        data = request.data
        stk = data.get("Body", {}).get("stkCallback", {})
        checkout_id = stk.get("CheckoutRequestID")
        result_code = str(stk.get("ResultCode"))
        result_desc = stk.get("ResultDesc", "")

        payment = get_object_or_404(MpesaPayment, checkout_request_id=checkout_id)
        payment.result_code = result_code
        payment.result_desc = result_desc
        payment.raw_callback = data

        if result_code == "0":
            items = stk.get("CallbackMetadata", {}).get("Item", [])
            receipt = next((i["Value"] for i in items if i.get("Name") == "MpesaReceiptNumber"), "")
            payment.receipt_number = receipt
            payment.status = "success"
        else:
            payment.status = "failed"

        payment.save()
        return Response({"ResultCode": 0, "ResultDesc": "Callback received successfully"})
