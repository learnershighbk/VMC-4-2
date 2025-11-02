from django.urls import path
from .views import UploadView, UploadLogListView, UploadLogDetailView

urlpatterns = [
    path('upload/', UploadView.as_view(), name='upload_csv'),
    path('upload-logs/', UploadLogListView.as_view(), name='upload_logs_list'),
    path('upload-logs/<uuid:pk>/', UploadLogDetailView.as_view(), name='upload_logs_detail'),
]
