from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import SupportMessage, SystemSettings
from .serializers import SupportMessageSerializer, SystemSettingsSerializer


# ---------------------------#
# Maintenance Status (GET)
# ---------------------------#
class MaintenanceStatusView(APIView):
    permission_classes = []

    def get(self, request):
        settings = SystemSettings.get_settings()
        return Response({"maintenance_mode": settings.maintenance_mode}, status=status.HTTP_200_OK)

# ---------------------------#
# Support Messages (GET/POST/PATCH)
# ---------------------------#
class SupportMessageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Only admins can view all messages
        if request.user.is_staff:
            messages = SupportMessage.objects.all()
        else:
            # Users can only see their own, but since it's for admin to view, perhaps only admins
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        serializer = SupportMessageSerializer(messages, many=True)
        return Response({"messages": serializer.data}, status=status.HTTP_200_OK)

    def post(self, request):
        # Users can send support messages
        serializer = SupportMessageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Support message sent successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk=None):
        # Admins can update messages (e.g., reply, mark as read)
        if not request.user.is_staff:
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
        try:
            message = SupportMessage.objects.get(pk=pk)
        except SupportMessage.DoesNotExist:
            return Response({"error": "Message not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = SupportMessageSerializer(message, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Message updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------#
# System Settings (GET/POST)
# ---------------------------#
class SystemSettingsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(settings)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Settings updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        settings = SystemSettings.get_settings()
        serializer = SystemSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Settings updated successfully"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
