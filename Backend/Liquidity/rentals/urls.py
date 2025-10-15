from django.urls import path
from .views import PendingReturnsView, UserRentalsView

app_name = "rentals"

urlpatterns = [
    path("pending-returns/", PendingReturnsView.as_view(), name="pending-returns"),
    path("user-rentals/", UserRentalsView.as_view(), name="user-rentals"),
]
