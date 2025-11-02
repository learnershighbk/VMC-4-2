from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'is_admin', 'is_staff', 'is_active', 'created_at']
    list_filter = ['is_admin', 'is_staff', 'is_active', 'created_at']
    search_fields = ['username', 'email']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('추가 정보', {'fields': ('is_admin', 'created_at', 'updated_at')}),
    )
    readonly_fields = ['created_at', 'updated_at']
