from rest_framework import serializers
from .models import RegistrationStepOne, RegistrationStepTwo, RegistrationStepThree

class RegistrationStepOneSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = RegistrationStepOne
        fields = ['id', 'full_name', 'email', 'password']

    def create(self, validated_data):
        # Normally, hash password here
        return RegistrationStepOne.objects.create(**validated_data)


class RegistrationStepTwoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationStepTwo
        fields = ['id', 'user', 'mobile_number', 'payment_status', 'mpesa_code']
        read_only_fields = ['user']


class RegistrationStepThreeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationStepThree
        fields = ['id', 'user', 'id_number', 'date_of_birth', 'address']
        read_only_fields = ['user']
