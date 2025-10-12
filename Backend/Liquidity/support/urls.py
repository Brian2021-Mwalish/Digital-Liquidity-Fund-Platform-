from django.urls import path
from .views import SupportMessageView, SystemSettingsView, MaintenanceStatusView

app_name = "support"

urlpatterns = [
    path("", SupportMessageView.as_view(), name="support-root"),
    path("messages/", SupportMessageView.as_view(), name="support-messages"),
    path("messages/<int:pk>/", SupportMessageView.as_view(), name="update-message"),
    path("settings/", SystemSettingsView.as_view(), name="system-settings"),
    path("maintenance/", MaintenanceStatusView.as_view(), name="maintenance-status"),
]
