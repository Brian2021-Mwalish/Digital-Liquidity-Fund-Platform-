# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from django.conf import settings
from .models import CustomUser

import jwt
import requests
import logging

# -----------------------
# Logger setup
# -----------------------
logger = logging.getLogger(__name__)


# -----------------------
# JWT Utility
# -----------------------
def create_jwt(user):
    """Generate JWT for authenticated user"""
    try:
        payload = {"user_id": user.id, "email": user.email}
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
        logger.info(f"JWT created for user {user.email}")
        return token
    except Exception as e:
        logger.error(f"JWT creation failed: {str(e)}")
        raise


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

        logger.info(f"Register attempt: {email}")

        if not full_name or not email or not password:
            logger.warning("Missing required fields during registration")
            return Response(
                {"error": "Full name, email, and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if CustomUser.objects.filter(email=email).exists():
            logger.warning(f"Duplicate registration attempt for {email}")
            return Response(
                {"error": "A user with this email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = CustomUser.objects.create_user(
                email=email, full_name=full_name, password=password
            )
            token = create_jwt(user)
            logger.info(f"User registered successfully: {email}")

            return Response(
                {
                    "message": "User registered successfully",
                    "token": token,
                    "user": {
                        "id": user.id,
                        "full_name": user.full_name,
                        "email": user.email,
                    },
                },
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"Registration failed: {str(e)}")
            return Response(
                {"error": f"Registration failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# -----------------------
# Login
# -----------------------
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        logger.info(f"Login attempt: {email}")

        if not email or not password:
            logger.warning("Missing credentials during login")
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = authenticate(request, email=email, password=password)
            if not user:
                logger.warning(f"Invalid login attempt for {email}")
                return Response(
                    {"error": "Invalid credentials."},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            token = create_jwt(user)
            logger.info(f"Login successful: {email}")

            return Response(
                {
                    "message": "Login successful",
                    "token": token,
                    "user": {
                        "id": user.id,
                        "full_name": user.full_name,
                        "email": user.email,
                    },
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error(f"Login failed: {str(e)}")
            return Response(
                {"error": f"Login failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# -----------------------
# Google OAuth
# -----------------------
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        logger.info("Google login attempt")

        if not token:
            logger.warning("Google login failed: No token provided")
            return Response(
                {"error": "Google token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Verify Google token
            google_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            response = requests.get(google_url)
            if response.status_code != 200:
                logger.warning("Invalid Google token received")
                return Response(
                    {"error": "Invalid Google token."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user_data = response.json()
            email = user_data.get("email")
            full_name = user_data.get("name")

            if not email:
                logger.warning("Google token did not return an email")
                return Response(
                    {"error": "Google token did not return an email."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Get or create user
            user, created = CustomUser.objects.get_or_create(
                email=email,
                defaults={
                    "full_name": full_name,
                    "password": CustomUser.objects.make_random_password(),
                },
            )

            if created:
                logger.info(f"New user created via Google: {email}")
            else:
                logger.info(f"Existing user logged in via Google: {email}")

            token = create_jwt(user)
            return Response(
                {
                    "message": "Google login successful",
                    "token": token,
                    "user": {
                        "id": user.id,
                        "full_name": user.full_name,
                        "email": user.email,
                    },
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(f"Google login failed: {str(e)}")
            return Response(
                {"error": f"Google login failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# -----------------------
# Profile (Protected)
# -----------------------
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        logger.info(f"Profile accessed: {user.email}")
        return Response(
            {
                "message": "Profile retrieved successfully",
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "date_joined": user.date_joined,
            },
            status=status.HTTP_200_OK,
        )
