# payment/mpesa.py
import base64
import datetime
import requests
from django.conf import settings


class MpesaClient:
    """
    Helper class for interacting with M-Pesa Daraja API (STK Push).
    Reads credentials from settings.py (.env).
    """

    def __init__(self):
        self.base_url = getattr(settings, "MPESA_BASE_URL", "https://sandbox.safaricom.co.ke")
        self.short_code = settings.MPESA_SHORTCODE
        self.passkey = settings.MPESA_PASSKEY
        self.callback_url = settings.MPESA_CALLBACK_URL
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET

    def _get_token(self):
        """
        Generate an OAuth token from Safaricom API.
        """
        url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        response = requests.get(url, auth=(self.consumer_key, self.consumer_secret), timeout=10)
        response.raise_for_status()
        return response.json()["access_token"]

    def stk_push(self, phone_e164: str, amount: int, account_ref="PAYMENT"):
        """
        Send STK Push request to Safaricom Daraja API.
        phone_e164: e.g. "254712345678"
        amount: KES amount to be deducted
        account_ref: reference (e.g. currency code)
        """
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        password_str = f"{self.short_code}{self.passkey}{timestamp}"
        password = base64.b64encode(password_str.encode()).decode()

        payload = {
            "BusinessShortCode": self.short_code,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone_e164,
            "PartyB": self.short_code,
            "PhoneNumber": phone_e164,
            "CallBackURL": self.callback_url,
            "AccountReference": account_ref,
            "TransactionDesc": "Payment via STK",
        }

        headers = {"Authorization": f"Bearer {self._get_token()}"}

        response = requests.post(
            f"{self.base_url}/mpesa/stkpush/v1/processrequest",
            json=payload,
            headers=headers,
            timeout=15,
        )
        response.raise_for_status()
        return response.json()
