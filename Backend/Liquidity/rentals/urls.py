from django.urls import path
from .views import PendingReturnsView

app_name = "rentals"

urlpatterns = [
    path("pending-returns/", PendingReturnsView.as_view(), name="pending-returns"),
]
