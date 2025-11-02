from django.contrib import admin
from .models import (
    DepartmentKPI,
    PublicationList,
    ResearchProjectData,
    StudentRoster,
    UploadLog,
)


@admin.register(DepartmentKPI)
class DepartmentKPIAdmin(admin.ModelAdmin):
    list_display = ['evaluation_year', 'college', 'department', 'employment_rate', 'created_at']
    list_filter = ['evaluation_year', 'college', 'department']
    search_fields = ['college', 'department']
    ordering = ['-evaluation_year', 'college', 'department']


@admin.register(PublicationList)
class PublicationListAdmin(admin.ModelAdmin):
    list_display = ['publication_id', 'title', 'first_author', 'journal_grade', 'publication_date']
    list_filter = ['journal_grade', 'project_linked', 'college', 'department']
    search_fields = ['publication_id', 'title', 'first_author', 'journal_name']
    ordering = ['-publication_date']


@admin.register(ResearchProjectData)
class ResearchProjectDataAdmin(admin.ModelAdmin):
    list_display = ['execution_id', 'project_name', 'principal_investigator', 'status', 'execution_date']
    list_filter = ['status', 'department', 'funding_agency']
    search_fields = ['execution_id', 'project_number', 'project_name', 'principal_investigator']
    ordering = ['-execution_date']


@admin.register(StudentRoster)
class StudentRosterAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'name', 'college', 'department', 'program_type', 'academic_status']
    list_filter = ['program_type', 'academic_status', 'college', 'department', 'gender']
    search_fields = ['student_id', 'name', 'email']
    ordering = ['student_id']


@admin.register(UploadLog)
class UploadLogAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'data_type', 'total_rows', 'success_rows', 'failed_rows', 'uploaded_by', 'created_at']
    list_filter = ['data_type', 'created_at']
    search_fields = ['file_name', 'uploaded_by__username']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
