# users/urls.py
from django.urls import path
from .views import RegisterView, LoginView, AdminLoginView, MagicLoginView, UserMeView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("admin-login/", AdminLoginView.as_view(), name="admin-login"),
    path("magic-login/", MagicLoginView.as_view(), name="magic-login"),
    path("accounts/me/", UserMeView.as_view(), name="user-me"),
]
