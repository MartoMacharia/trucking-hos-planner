# backend/api/serializers.py
from rest_framework import serializers
from drf_spectacular.utils import extend_schema_serializer, OpenApiExample

@extend_schema_serializer(
    examples=[
        OpenApiExample(
            'Valid example',
            summary='Example trip request',
            description='A typical trip from New York to Washington DC',
            value={
                'current_location': 'New York, NY',
                'pickup_location': 'Philadelphia, PA',
                'dropoff_location': 'Washington, DC',
                'current_cycle_hours': 20.5
            },
            request_only=True,
        ),
    ]
)
class TripRequestSerializer(serializers.Serializer):
    current_location = serializers.CharField(
        max_length=200,
        help_text="Driver's current location (address or city, state)"
    )
    pickup_location = serializers.CharField(
        max_length=200,
        help_text="Location where cargo will be picked up"
    )
    dropoff_location = serializers.CharField(
        max_length=200,
        help_text="Final destination for cargo delivery"
    )
    current_cycle_hours = serializers.FloatField(
        min_value=0, 
        max_value=70,
        help_text="Hours already used in current 70-hour/8-day cycle"
    )

class StopSerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=['rest', 'fuel', 'break', 'pickup', 'dropoff'])
    mile_marker = serializers.FloatField()
    duration = serializers.IntegerField(help_text="Duration in minutes")
    description = serializers.CharField()
    location = serializers.DictField(required=False)

class LogSheetSerializer(serializers.Serializer):
    day = serializers.IntegerField()
    date = serializers.DateField()
    driving_hours = serializers.FloatField()
    on_duty_hours = serializers.FloatField()
    off_duty_hours = serializers.FloatField()
    sleeper_berth_hours = serializers.FloatField(default=0)
    log_image = serializers.CharField(help_text="Base64 encoded log sheet image")

class TripResponseSerializer(serializers.Serializer):
    route = serializers.JSONField(help_text="Route coordinates and details")
    stops = StopSerializer(many=True)
    log_sheets = LogSheetSerializer(many=True)
    total_distance = serializers.FloatField(help_text="Total trip distance in miles")
    total_time = serializers.FloatField(help_text="Total trip time in hours")
    fuel_stops = StopSerializer(many=True)