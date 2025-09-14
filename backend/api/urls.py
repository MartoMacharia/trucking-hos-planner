from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.HealthCheckView.as_view(), name='health-check'),
    path('calculate-trip/', views.CalculateTripView.as_view(), name='calculate-trip'),
    path('trip-history/', views.TripHistoryView.as_view(), name='trip-history'),
]