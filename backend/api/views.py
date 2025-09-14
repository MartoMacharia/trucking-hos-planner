# backend/api/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from .serializers import (
    TripRequestSerializer, 
    TripResponseSerializer
)

class HealthCheckView(APIView):
    @extend_schema(
        summary="Health Check",
        description="Check if the API service is running",
        responses={200: dict},
        tags=["Health"]
    )
    def get(self, request):
        """
        Returns the health status of the API
        """
        return Response({
            "status": "healthy", 
            "service": "Trucking HOS Planner API",
            "version": "1.0.0"
        })

class CalculateTripView(APIView):
    @extend_schema(
        summary="Calculate Trip Route",
        description="""
        Calculates the optimal route for a truck trip considering:
        - Hours of Service (HOS) regulations
        - Required rest breaks (10-hour rest after 11 hours driving)
        - 30-minute break requirement after 8 hours
        - Fuel stops every 1000 miles
        - 70-hour/8-day driving limit
        
        The API returns:
        - Complete route with waypoints
        - All required stops (rest, fuel, breaks)
        - ELD log sheets for each day
        - Total time and distance calculations
        """,
        request=TripRequestSerializer,
        responses={
            200: TripResponseSerializer,
            400: dict,
        },
        tags=["Trip Planning"]
    )
    def post(self, request):
        """
        Calculate a compliant trip route with all required stops
        """
        serializer = TripRequestSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            
            # Mock response for testing
            response_data = {
                'route': {
                    'points': [
                        {'lat': 40.7128, 'lng': -74.0060},
                        {'lat': 39.9526, 'lng': -75.1652},
                        {'lat': 38.9072, 'lng': -77.0369}
                    ],
                    'total_distance': 225
                },
                'stops': [
                    {
                        'type': 'pickup',
                        'mile_marker': 95,
                        'duration': 60,
                        'description': 'Pickup at Philadelphia, PA',
                        'location': {'lat': 39.9526, 'lng': -75.1652}
                    },
                    {
                        'type': 'dropoff',
                        'mile_marker': 225,
                        'duration': 60,
                        'description': 'Dropoff at Washington, DC',
                        'location': {'lat': 38.9072, 'lng': -77.0369}
                    }
                ],
                'log_sheets': [
                    {
                        'day': 1,
                        'date': '2024-01-01',
                        'driving_hours': 4.1,
                        'on_duty_hours': 2,
                        'off_duty_hours': 17.9,
                        'sleeper_berth_hours': 0,
                        'log_image': 'base64_placeholder'
                    }
                ],
                'total_distance': 225,
                'total_time': 6.1,
                'fuel_stops': []
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TripHistoryView(APIView):
    @extend_schema(
        summary="Get Trip History",
        description="Retrieve historical trip data",
        parameters=[
            OpenApiParameter(
                name='start_date',
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description='Start date for history query',
                required=False
            ),
            OpenApiParameter(
                name='end_date',
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description='End date for history query',
                required=False
            ),
        ],
        responses={200: dict},
        tags=["Trip History"]
    )
    def get(self, request):
        """
        Get historical trip data within date range
        """
        # Implementation here
        return Response({"trips": []})