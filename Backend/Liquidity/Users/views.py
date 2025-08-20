# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, logout
from django.utils.timezone import now
from django.conf import settings
from .models import CustomUser

import logging
import requests
from rest_framework_simplejwt.tokens import RefreshToken

# -----------------------
# Logger setup
# -----------------------
logger = logging.getLogger(__name__)

# -----------------------
# JWT Utility
# -----------------------
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

# -----------------------
# Register
# -----------------------
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        full_name = data.get("full_name")
        email = data.get("email")
        password = data.get("password")

        if not full_name or not email or not password:
            return Response({"error": "Full name, email, and password are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        if CustomUser.objects.filter(email=email).exists():
            return Response({"error": "A user with this email already exists."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.create_user(
                email=email, full_name=full_name, password=password
            )
            tokens = get_tokens_for_user(user)

            request.session["user_id"] = user.id
            request.session["last_activity"] = str(now())

            return Response({
                "message": "User registered successfully",
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "is_superuser": user.is_superuser,
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Registration failed: {str(e)}")
            return Response({"error": f"Registration failed: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# -----------------------
# Login
# -----------------------
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)
        if not user:
            return Response({"error": "Invalid credentials."},
                            status=status.HTTP_401_UNAUTHORIZED)

        tokens = get_tokens_for_user(user)
        request.session["user_id"] = user.id
        request.session["last_activity"] = str(now())

        return Response({
            "message": "Login successful",
            "access": tokens["access"],
            "refresh": tokens["refresh"],
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "is_superuser": user.is_superuser,
            }
        }, status=status.HTTP_200_OK)

# -----------------------
# Logout
# -----------------------
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            logout(request)
            request.session.flush()
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Logout failed: {str(e)}")
            return Response({"error": f"Logout failed: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# -----------------------
# Google OAuth
# -----------------------
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"error": "Google token is required."}, status=400)

        try:
            # Verify token with Google
            google_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            resp = requests.get(google_url)
            if resp.status_code != 200:
                return Response({"error": "Invalid Google token."}, status=400)

            user_data = resp.json()
            email = user_data.get("email")
            full_name = user_data.get("name")
            if not email:
                return Response({"error": "Google token did not return an email."}, status=400)

            # Get or create user
            user, created = CustomUser.objects.get_or_create(
                email=email,
                defaults={"full_name": full_name, "password": CustomUser.objects.make_random_password()},
            )

            tokens = get_tokens_for_user(user)
            request.session["user_id"] = user.id
            request.session["last_activity"] = str(now())

            return Response({
                "message": "Google login successful",
                "access": tokens["access"],
                "refresh": tokens["refresh"],
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "is_superuser": user.is_superuser,
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Google login failed: {str(e)}")
            return Response({"error": f"Google login failed: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# -----------------------
# Profile (Protected)
# -----------------------
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        request.session["last_activity"] = str(now())
        return Response({
            "message": "Profile retrieved successfully",
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "date_joined": user.date_joined,
            "last_activity": request.session.get("last_activity"),
        }, status=status.HTTP_200_OK)

# -----------------------
# Session List (Protected)
# -----------------------
class SessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.session.get("user_id")
        last_activity = request.session.get("last_activity")

        sessions = [{
            "id": user_id,
            "device": "Unknown",
            "last_active": last_activity,
        }]

        return Response({"sessions": sessions}, status=status.HTTP_200_OK)
