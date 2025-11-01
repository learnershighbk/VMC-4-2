from django.urls import path
from .views import health, ItemList  # views.py의 함수/클래스 import

urlpatterns = [
    path('health/', health),
    path('items/', ItemList.as_view()),
]
