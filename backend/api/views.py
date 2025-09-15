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
from .services.route_calculator import RouteCalculator
from .services.hos_calculator import HOSCalculator
from .services.log_generator import LogGenerator

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

            # Calculate route (still mock distances/points in RouteCalculator)
            route_calc = RouteCalculator()
            route = route_calc.calculate(
                data['current_location'],
                data['pickup_location'],
                data['dropoff_location']
            )

            # Plan HOS based on route total distance
            hos = HOSCalculator()
            hos_plan = hos.plan_trip(route_data=route, current_cycle_hours=data['current_cycle_hours'])

            # Generate ELD log sheets as base64 PNGs
            log_gen = LogGenerator()
            logs = log_gen.generate_logs(hos_plan)

            response_data = {
                'route': route,
                'stops': hos_plan['stops'],
                'log_sheets': logs,
                'total_distance': route['total_distance'],
                'total_time': hos_plan['total_time'],
                'fuel_stops': hos_plan['fuel_stops'],
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