# users/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.contrib.auth import authenticate, logout, get_user_model
from django.utils.timezone import now
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode

from .models import CustomUser, KYCProfile, Referral
from .serializers import KYCProfileSerializer, UserProfileSerializer

import logging
import requests
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Count

# -----------------------
# Logger setup
# -----------------------
logger = logging.getLogger(__name__)

User = get_user_model()
token_generator = PasswordResetTokenGenerator()

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
        referral_code = data.get("referral_code")  # ✅ optional referral code

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


            # Handle referral code from registration
            if referral_code:
                try:
                    referrer = CustomUser.objects.get(referral_code=referral_code)
                    # Create referral if not exists for this email
                    referral_obj, created = Referral.objects.get_or_create(
                        referrer=referrer,
                        referred_email=email,
                        defaults={"referred_name": full_name}
                    )
                    # Mark referral as completed if user just registered
                    referral_obj.mark_completed(user)
                    logger.info(f"Referral recorded: {referrer.email} referred {user.email}")
                except CustomUser.DoesNotExist:
                    logger.warning(f"Invalid referral code used: {referral_code}")

            tokens = get_tokens_for_user(user)

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
            return Response({"error": "Registration failed."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# -----------------------
# Login with Email + JWT
# -----------------------
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "No account found with this email."},
                            status=status.HTTP_404_NOT_FOUND)

        if not user.is_active:
            return Response({"error": "This account is blocked. Contact admin."},
                            status=status.HTTP_403_FORBIDDEN)

        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response({"error": "Incorrect email or password."},
                            status=status.HTTP_401_UNAUTHORIZED)

        tokens = get_tokens_for_user(user)

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
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Logout failed: {str(e)}")
            return Response({"error": "Logout failed."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# -----------------------
# Google OAuth Login
# -----------------------
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token:
            return Response({"error": "Google token is required."}, status=400)

        try:
            google_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            resp = requests.get(google_url)
            if resp.status_code != 200:
                return Response({"error": "Invalid Google token."}, status=400)

            user_data = resp.json()
            email = user_data.get("email")
            full_name = user_data.get("name")

            if not email:
                return Response({"error": "Google token did not return an email."}, status=400)

            user, _ = CustomUser.objects.get_or_create(
                email=email,
                defaults={"full_name": full_name, "password": CustomUser.objects.make_random_password()},
            )

            tokens = get_tokens_for_user(user)

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
            return Response({"error": "Google login failed."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# -----------------------
# Profile
# -----------------------
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -----------------------
# Session List
# -----------------------
class SessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "sessions": [{
                "id": request.user.id,
                "device": "Unknown",
                "last_active": str(now()),
            }]
        }, status=status.HTTP_200_OK)

# -----------------------
# Forgot Password
# -----------------------
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "User with this email does not exist."},
                            status=status.HTTP_404_NOT_FOUND)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        logger.info(f"Password reset link generated for user {user.email}: {reset_link}")
        print(f"Password reset link generated for user {user.email}: {reset_link}")

        try:
            send_mail(
                subject="Password Reset Request",
                message=f"Click the link to reset your password: {reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            logger.error(f"Failed to send reset email: {str(e)}")
            return Response({"error": "Failed to send reset email."},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)

# -----------------------
# Reset Password
# -----------------------
class ResetPasswordView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({"error": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST)

        if not token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"message": "Token is valid."}, status=status.HTTP_200_OK)
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        password = request.data.get("password")
        if not password:
            return Response({"error": "Password is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response({"error": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST)

        if not token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save()

        return Response({"message": "Password reset successful."}, status=status.HTTP_200_OK)

# -----------------------
# Admin Views
# -----------------------
class UserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from .serializers import UserSerializer
        users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class BlockUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        try:
            user = CustomUser.objects.get(pk=user_id)
            if user.is_superuser:
                return Response({"error": "You cannot block a superuser."}, status=status.HTTP_403_FORBIDDEN)
            user.is_active = False
            user.save()
            return Response({"message": f"User {user.email} has been blocked."}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class UnblockUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        try:
            user = CustomUser.objects.get(pk=user_id)
            user.is_active = True
            user.save()
            return Response({"message": f"User {user.email} has been unblocked."}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

# -----------------------
# KYC Profile
# -----------------------
class KYCProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = KYCProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            return self.request.user.kyc
        except KYCProfile.DoesNotExist:
            return KYCProfile.objects.create(
                user=self.request.user,
                email=self.request.user.email,
                full_name=self.request.user.full_name
            )

class KYCListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        kycs = KYCProfile.objects.select_related("user").all()
        data = [
            {
                "id": kyc.id,
                "user_id": kyc.user.id,
                "full_name": kyc.full_name,
                "email": kyc.email,
                "mobile": kyc.mobile,
                "national_id": kyc.national_id,
                "address": kyc.address,
                "status": kyc.status,
                "date_submitted": kyc.created_at,
            }
            for kyc in kycs
        ]
        return Response({"kyc_forms": data}, status=status.HTTP_200_OK)

class KYCVerifyView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, kyc_id):
        try:
            kyc = KYCProfile.objects.get(pk=kyc_id)
            kyc.status = "verified"
            kyc.save()
            return Response({"message": "KYC verified."}, status=status.HTTP_200_OK)
        except KYCProfile.DoesNotExist:
            return Response({"error": "KYC not found."}, status=status.HTTP_404_NOT_FOUND)

# -----------------------
# Referral Views
# -----------------------
class ReferralListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        referrals = Referral.objects.filter(referrer=request.user).select_related("referred")
        data = [
            {
                "id": r.referred.id if r.referred else None,
                "email": r.referred.email if r.referred else r.referred_email,
                "full_name": r.referred.full_name if r.referred else None,
                "date_joined": r.referred.date_joined if r.referred else r.created_at,
            }
            for r in referrals
        ]
        return Response({"referrals": data, "total": len(data)}, status=status.HTTP_200_OK)


# -----------------------
# Referral Code (for logged in user)
# -----------------------
class ReferralCodeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "referral_code": user.referral_code
        })


# -----------------------
# Referral History (who this user referred)
# -----------------------
class ReferralHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        referred_users = user.referrals.all()  # related_name="referrals"
        history = [
            {
                "email": u.email,
                "full_name": u.full_name,
                "date_joined": u.date_joined,
            }
            for u in referred_users
        ]
        return Response({"history": history})


# -----------------------
# Referral Admin (see who referred who + stats)
# -----------------------
class ReferralAdminView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        all_referrals = Referral.objects.select_related("referrer", "referred")
        referral_data = [
            {
                "referrer_id": r.referrer.id if r.referrer else None,
                "referrer_email": r.referrer.email if r.referrer else None,
                "referred_id": r.referred.id if r.referred else None,
                "referred_email": r.referred.email if r.referred else r.referred_email,
                "date_referred": r.created_at,  # <-- always use referral creation date
            }
            for r in all_referrals
        ]

        total_referrals = all_referrals.count()
        top_referrers = (
            Referral.objects.values("referrer__id", "referrer__email", "referrer__full_name")
            .annotate(total=Count("id"))
            .order_by("-total")[:10]
        )

        return Response({
            "total_referrals": total_referrals,
            "referral_relationships": referral_data,
            "top_referrers": list(top_referrers),
        }, status=status.HTTP_200_OK)

# Add this to views.py if you want the endpoint
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_award_wallet(request, user_id):
    amount = request.data.get('amount', 0)
    try:
        user = CustomUser.objects.get(pk=user_id)
        user.wallet += float(amount)
        user.save()
        return Response({"message": f"Wallet updated for {user.email}."}, status=200)
    except CustomUser.DoesNotExist:
        return Response({"error": "User not found."}, status=404)
