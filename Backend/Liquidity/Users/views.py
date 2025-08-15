from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        data = request.data.copy()
        data.pop("confirmPassword", None)
        serializer = RegisterSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            login_link = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/login"
            try:
                send_mail(
                    subject="🎉 Welcome to Liquidity — Your Account is Ready",
                    message=(
                        f"Hi {user.full_name},\n\n"
                        f"Your Liquidity account has been created successfully!\n\n"
                        f"Log in here: {login_link}\n\n"
                        f"Thanks for joining us!\n"
                        f"- The Liquidity Team"
                    ),
                    from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@liquidity.com"),
                    recipient_list=[user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Email send failed: {e}")
            return Response(
                {"message": "✅ Registration successful! Please check your email for login instructions."},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            is_superuser = serializer.validated_data.get("is_superuser", 0)
            refresh = RefreshToken.for_user(user)
            return Response({
                "message": f"✅ Login successful. Welcome back, {user.full_name}!",
                "is_superuser": is_superuser,
                "token": str(refresh.access_token),
                "name": user.full_name,
                "email": user.email,
            })
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


# --- Fetching client profile for /api/user/accounts/me/ ---
class UserMeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        return Response({
            'name': user.full_name,
            'email': user.email,
            'dob': getattr(user, 'dob', None),
            'id_number': getattr(user, 'id_number', None),
            'phone': getattr(user, 'phone', None),
            'address': getattr(user, 'address', None),
        })
