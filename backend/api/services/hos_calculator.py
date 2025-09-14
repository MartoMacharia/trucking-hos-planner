# backend/api/services/hos_calculator.py
from datetime import datetime, timedelta

class HOSCalculator:
    """
    Implements FMCSA Hours of Service regulations for property carriers
    Based on 70-hour/8-day rule
    """
    
    MAX_DRIVING_HOURS = 11  # Maximum driving in 14-hour window
    MAX_DUTY_HOURS = 14     # Maximum on-duty time
    REQUIRED_BREAK_MINUTES = 30  # Required after 8 hours driving
    MIN_OFF_DUTY_HOURS = 10  # Minimum consecutive off-duty hours
    MAX_WEEKLY_HOURS = 70   # Maximum in 8 days
    
    def plan_trip(self, route_data, current_cycle_hours):
        """
        Plans trip with HOS compliance
        Returns stops for rest, fuel, and breaks
        """
        total_distance = route_data['total_distance']
        driving_hours_needed = total_distance / 55  # Assuming 55 mph average
        
        stops = []
        current_driving = 0
        current_on_duty = 0
        days = []
        current_day = self._create_new_day()
        
        # Add pickup time (1 hour on-duty not driving)
        current_day['on_duty_not_driving'] += 1
        current_on_duty += 1
        
        remaining_distance = total_distance
        
        while remaining_distance > 0:
            # Check if we need 30-minute break
            if current_driving >= 8 and not current_day['break_taken']:
                stops.append({
                    'type': 'break',
                    'duration': 30,
                    'location': self._calculate_location(route_data, total_distance - remaining_distance)
                })
                current_day['break_taken'] = True
                current_on_duty += 0.5
            
            # Check if we need to rest
            if current_driving >= self.MAX_DRIVING_HOURS or current_on_duty >= self.MAX_DUTY_HOURS:
                stops.append({
                    'type': 'rest',
                    'duration': 10 * 60,  # 10 hours in minutes
                    'location': self._calculate_location(route_data, total_distance - remaining_distance)
                })
                days.append(current_day)
                current_day = self._create_new_day()
                current_driving = 0
                current_on_duty = 0
            
            # Check for fuel stop
            distance_since_fuel = total_distance - remaining_distance
            if distance_since_fuel > 0 and distance_since_fuel % 1000 == 0:
                stops.append({
                    'type': 'fuel',
                    'duration': 30,
                    'location': self._calculate_location(route_data, distance_since_fuel)
                })
                current_on_duty += 0.5
            
            # Drive for next segment
            drive_hours = min(
                self.MAX_DRIVING_HOURS - current_driving,
                remaining_distance / 55
            )
            
            current_driving += drive_hours
            current_on_duty += drive_hours
            current_day['driving'] += drive_hours
            remaining_distance -= drive_hours * 55
        
        # Add dropoff time
        current_day['on_duty_not_driving'] += 1
        days.append(current_day)
        
        return {
            'stops': stops,
            'days': days,
            'total_time': sum(d['driving'] + d['on_duty_not_driving'] + d['off_duty'] for d in days),
            'fuel_stops': [s for s in stops if s['type'] == 'fuel']
        }
    
    def _create_new_day(self):
        return {
            'driving': 0,
            'on_duty_not_driving': 0,
            'sleeper_berth': 0,
            'off_duty': 0,
            'break_taken': False
        }
    
    def _calculate_location(self, route_data, distance_traveled):
        # Calculate position along route based on distance
        # This would use the actual route coordinates
        return {
            'lat': 0,  # Calculate from route
            'lng': 0   # Calculate from route
        }