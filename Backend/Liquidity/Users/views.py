from rest_framework import generics, status
from rest_framework.response import Response
from .models import RegistrationStepOne, RegistrationStepTwo, RegistrationStepThree
from .serializers import RegistrationStepOneSerializer, RegistrationStepTwoSerializer, RegistrationStepThreeSerializer

class StepOneRegisterView(generics.CreateAPIView):
    queryset = RegistrationStepOne.objects.all()
    serializer_class = RegistrationStepOneSerializer


class StepTwoRegisterView(generics.UpdateAPIView):
    queryset = RegistrationStepTwo.objects.all()
    serializer_class = RegistrationStepTwoSerializer
    lookup_url_kwarg = 'user_id'

    def get_object(self):
        user_id = self.kwargs.get(self.lookup_url_kwarg)
        # Assuming RegistrationStepTwo has a OneToOne or ForeignKey to RegistrationStepOne user id
        return self.queryset.get(user__id=user_id)

    def put(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class StepThreeRegisterView(generics.UpdateAPIView):
    queryset = RegistrationStepThree.objects.all()
    serializer_class = RegistrationStepThreeSerializer
    lookup_url_kwarg = 'user_id'

    def get_object(self):
        user_id = self.kwargs.get(self.lookup_url_kwarg)
        # Assuming RegistrationStepThree has a OneToOne or ForeignKey to RegistrationStepOne user id
        return self.queryset.get(user__id=user_id)

    def put(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
