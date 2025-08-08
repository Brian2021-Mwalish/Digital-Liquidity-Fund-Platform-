from django.urls import path
from .views import StepOneRegisterView, StepTwoRegisterView, StepThreeRegisterView

urlpatterns = [
    path('register/step-one/', StepOneRegisterView.as_view(), name='step-one'),
    path('register/step-two/<int:user_id>/', StepTwoRegisterView.as_view(), name='step-two'),
    path('register/step-three/<int:user_id>/', StepThreeRegisterView.as_view(), name='step-three'),
]
