from django.http import HttpResponse
from django.template.loader import render_to_string
from .models import SystemSettings

class MaintenanceModeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if maintenance mode is enabled
        settings = SystemSettings.get_settings()
        # Allow auth endpoints and maintenance status even in maintenance mode to enable admin login and frontend notification
        if settings.maintenance_mode and not request.user.is_staff and not request.path.startswith('/api/auth/') and request.path != '/api/support/maintenance/':
            # Return maintenance page for non-admin users
            html = render_to_string('maintenance.html', {'message': 'The system is currently under maintenance. Please try again later.'})
            return HttpResponse(html, status=503)
        return self.get_response(request)
