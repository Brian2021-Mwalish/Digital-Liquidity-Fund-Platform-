# users/urls.py
from django.urls import path
from .views import RegisterView, LoginView, GoogleLoginView, ProfileView

urlpatterns = [
    # Registration
    path("register/", RegisterView.as_view(), name="register"),

    # Email & password login
    path("login/", LoginView.as_view(), name="login"),

    # Google OAuth login
    path("google/", GoogleLoginView.as_view(), name="google-login"),

    # Authenticated user profile (requires JWT in Authorization header)
    path("profile/", ProfileView.as_view(), name="profile"),
]
