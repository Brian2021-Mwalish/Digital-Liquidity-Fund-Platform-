from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    GoogleLoginView,
    ProfileView,
    LogoutView,
    SessionListView,  # 🔹 Import the session list view
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("google/", GoogleLoginView.as_view(), name="google-login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("sessions/", SessionListView.as_view(), name="sessions-list"),  # 🔹 Add sessions endpoint
]
