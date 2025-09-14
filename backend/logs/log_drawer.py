from PIL import Image, ImageDraw, ImageFont
from datetime import datetime, timedelta
import io
import base64

class LogSheetDrawer:
    """
    Generates visual ELD log sheets based on HOS data
    """
    
    def __init__(self):
        self.width = 1200
        self.height = 800
        self.margin = 50
        self.grid_start_x = 150
        self.grid_start_y = 200
        self.grid_width = 1000
        self.grid_height = 400
        
    def draw_log_sheet(self, day_data, date, driver_info):
        """
        Creates a visual log sheet for a single day
        """
        # Create blank image
        img = Image.new('RGB', (self.width, self.height), 'white')
        draw = ImageDraw.Draw(img)
        
        # Draw header
        self._draw_header(draw, date, driver_info)
        
        # Draw time grid
        self._draw_grid(draw)
        
        # Draw duty status lines
        self._draw_duty_status(draw, day_data)
        
        # Draw totals
        self._draw_totals(draw, day_data)
        
        # Convert to base64 for API response
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            'image': img_str,
            'date': date.isoformat(),
            'totals': {
                'driving': day_data['driving'],
                'on_duty': day_data['on_duty_not_driving'],
                'sleeper': day_data['sleeper_berth'],
                'off_duty': day_data['off_duty']
            }
        }
    
    def _draw_header(self, draw, date, driver_info):
        # Draw form header
        draw.text((self.width // 2, 30), "DRIVER'S DAILY LOG", 
                 fill='black', anchor='mm')
        draw.text((self.width // 2, 60), "(ONE CALENDAR DAY - 24 HOURS)", 
                 fill='black', anchor='mm')
        
        # Date and driver info
        draw.text((100, 100), f"Date: {date.strftime('%m/%d/%Y')}", fill='black')
        draw.text((400, 100), f"Driver: {driver_info.get('name', 'N/A')}", fill='black')
        
    def _draw_grid(self, draw):
        # Draw 24-hour grid
        hours = 24
        hour_width = self.grid_width / hours
        
        # Draw horizontal lines for each duty status
        statuses = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty\n(Not Driving)']
        status_height = self.grid_height / len(statuses)
        
        for i, status in enumerate(statuses):
            y = self.grid_start_y + (i * status_height)
            draw.line([(self.grid_start_x, y), 
                      (self.grid_start_x + self.grid_width, y)], 
                     fill='black', width=1)
            draw.text((50, y + status_height/2), status, fill='black', anchor='lm')
        
        # Draw vertical hour lines
        for hour in range(25):
            x = self.grid_start_x + (hour * hour_width)
            draw.line([(x, self.grid_start_y), 
                      (x, self.grid_start_y + self.grid_height)], 
                     fill='gray', width=1)
            if hour < 24:
                draw.text((x + hour_width/2, self.grid_start_y - 10), 
                         str(hour), fill='black', anchor='mm')
    
    def _draw_duty_status(self, draw, day_data):
        # Draw actual duty status lines based on day_data
        # This would parse the time segments and draw appropriate lines
        pass
    
    def _draw_totals(self, draw, day_data):
        # Draw total hours for each status
        y_start = self.grid_start_y + self.grid_height + 50
        draw.text((800, y_start), "TOTAL HOURS", fill='black')
        draw.text((900, y_start + 30), f"Off Duty: {day_data['off_duty']:.1f}", fill='black')
        draw.text((900, y_start + 50), f"Sleeper: {day_data['sleeper_berth']:.1f}", fill='black')
        draw.text((900, y_start + 70), f"Driving: {day_data['driving']:.1f}", fill='black')
        draw.text((900, y_start + 90), f"On Duty: {day_data['on_duty_not_driving']:.1f}", fill='black')