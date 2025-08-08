from django.db import models

class RegistrationStepOne(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # Store hashed password in production

    def __str__(self):
        return self.email

class RegistrationStepTwo(models.Model):
    user = models.OneToOneField(RegistrationStepOne, on_delete=models.CASCADE)
    mobile_number = models.CharField(max_length=20)
    payment_status = models.BooleanField(default=False)
    mpesa_code = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.mobile_number

class RegistrationStepThree(models.Model):
    user = models.OneToOneField(RegistrationStepOne, on_delete=models.CASCADE)
    id_number = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    address = models.TextField()

    def __str__(self):
        return f"{self.user.full_name} - KYC"
