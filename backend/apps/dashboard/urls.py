from django.urls import path
from .views import OverviewView, PerformanceView, PapersView, StudentsView, BudgetView

urlpatterns = [
    path('overview/', OverviewView.as_view(), name='dashboard_overview'),
    path('performance/', PerformanceView.as_view(), name='dashboard_performance'),
    path('papers/', PapersView.as_view(), name='dashboard_papers'),
    path('students/', StudentsView.as_view(), name='dashboard_students'),
    path('budget/', BudgetView.as_view(), name='dashboard_budget'),
]
