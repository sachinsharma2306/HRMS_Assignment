from django.urls import path
from . import views

urlpatterns = [
    path('employees/', views.EmployeeListCreateView.as_view()),
    path('employees/<int:pk>/', views.EmployeeDetailView.as_view()),
    path('attendance/', views.AttendanceListCreateView.as_view()),
    path('attendance/<int:pk>/', views.AttendanceDetailView.as_view()),
    path('dashboard/', views.DashboardView.as_view()),
]