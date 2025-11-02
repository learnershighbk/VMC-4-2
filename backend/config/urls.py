"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/data/', include('apps.data_upload.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
]
