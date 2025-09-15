# backend/api/services/log_generator.py
from typing import Dict, List
from datetime import date, timedelta
from logs.log_drawer import LogSheetDrawer

class LogGenerator:
    """
    Generates ELD log sheets
    """
    
    def __init__(self):
        self.drawer = LogSheetDrawer()

    def generate_logs(self, hos_plan: Dict, start_date: date = None, driver_info: Dict = None) -> List[Dict]:
        """
        Generate log sheets based on HOS plan days. Each element in hos_plan['days'] should
        include numeric totals for 'driving', 'on_duty_not_driving', 'sleeper_berth', 'off_duty'.
        """
        if start_date is None:
            start_date = date.today()
        driver_info = driver_info or {"name": "Driver"}

        logs: List[Dict] = []
        days = hos_plan.get('days', [])
        for i, day_data in enumerate(days):
            current_date = start_date + timedelta(days=i)
            rendered = self.drawer.draw_log_sheet(day_data, current_date, driver_info)
            logs.append({
                'day': i + 1,
                'date': current_date.isoformat(),
                'driving_hours': float(day_data.get('driving', 0)),
                'on_duty_hours': float(day_data.get('on_duty_not_driving', 0)),
                'off_duty_hours': float(day_data.get('off_duty', 0)),
                'sleeper_berth_hours': float(day_data.get('sleeper_berth', 0)),
                'log_image': rendered['image']
            })
        return logs