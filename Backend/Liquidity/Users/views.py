from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, LoginSerializer


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()

            login_link = f"{settings.FRONTEND_URL}/login"

            send_mail(
                subject="🎉 Welcome to Liquidity — Your Account is Ready",
                message=(
                    f"Hi {user.full_name},\n\n"
                    f"Your Liquidity account has been created successfully!\n\n"
                    f"Log in here: {login_link}\n\n"
                    f"Thanks for joining us!\n"
                    f"- The Liquidity Team"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response(
                {"message": "✅ Registration successful! Please check your email for login instructions."},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            return Response({"message": f"✅ Login successful. Welcome back, {user.full_name}!"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MagicLoginView(APIView):  # placeholder
    def get(self, request):
        return Response({"message": "Magic login placeholder"}, status=status.HTTP_200_OK)


class AdminLoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            if not user.is_staff:
                return Response({"error": "❌ Invalid admin credentials."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"message": f"✅ Admin login successful. Welcome, {user.full_name}!"})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
