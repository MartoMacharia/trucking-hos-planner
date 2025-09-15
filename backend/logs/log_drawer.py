# backend/logs/log_drawer.py
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime, timedelta
import io
import base64

class LogSheetDrawer:
    """
    ELD log sheet drawer that matches FMCSA format with proper grid and segments
    """
    
    def __init__(self):
        self.width = 1200
        self.height = 800
        self.margin = 50
        self.grid_start_x = 150
        self.grid_start_y = 250
        self.grid_width = 960
        self.grid_height = 320
        
        # Try to load fonts
        try:
            self.font_large = ImageFont.truetype("arial.ttf", 20)
            self.font_medium = ImageFont.truetype("arial.ttf", 14)
            self.font_small = ImageFont.truetype("arial.ttf", 12)
        except:
            self.font_large = ImageFont.load_default()
            self.font_medium = ImageFont.load_default()
            self.font_small = ImageFont.load_default()
    
    def draw_log_sheet(self, day_data, date, driver_info):
        """
        Creates a complete ELD log sheet matching FMCSA format
        """
        img = Image.new('RGB', (self.width, self.height), 'white')
        draw = ImageDraw.Draw(img)
        
        # Draw all components
        self._draw_header(draw, date, driver_info)
        self._draw_info_section(draw, driver_info)
        self._draw_grid(draw)
        self._draw_duty_status_lines(draw, day_data)
        self._draw_totals(draw, day_data)
        self._draw_remarks(draw, day_data)
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            'image': img_str,
            'date': date.isoformat(),
            'totals': {
                'driving': day_data.get('driving', 0),
                'on_duty': day_data.get('on_duty_not_driving', 0),
                'sleeper': day_data.get('sleeper_berth', 0),
                'off_duty': day_data.get('off_duty', 0)
            }
        }
    
    def _draw_header(self, draw, date, driver_info):
        """Draw the header section"""
        # Title
        draw.text((self.width // 2, 30), "DRIVER'S DAILY LOG", 
                 fill='black', anchor='mm', font=self.font_large)
        draw.text((self.width // 2, 55), "(ONE CALENDAR DAY - 24 HOURS)", 
                 fill='black', anchor='mm', font=self.font_small)
    
    def _draw_info_section(self, draw, driver_info):
        """Draw driver and vehicle information section"""
        y_start = 100
        
        # Date box
        draw.rectangle([(50, y_start), (300, y_start + 30)], outline='black')
        draw.text((55, y_start + 5), "Date:", fill='black', font=self.font_medium)
        draw.text((100, y_start + 5), datetime.now().strftime("%m/%d/%Y"), 
                 fill='black', font=self.font_medium)
        
        # Driver name box
        draw.rectangle([(320, y_start), (600, y_start + 30)], outline='black')
        draw.text((325, y_start + 5), "Driver:", fill='black', font=self.font_medium)
        draw.text((380, y_start + 5), driver_info.get('name', 'Driver'), 
                 fill='black', font=self.font_medium)
        
        # From/To boxes
        y_start += 40
        draw.rectangle([(50, y_start), (300, y_start + 30)], outline='black')
        draw.text((55, y_start + 5), "From:", fill='black', font=self.font_medium)
        draw.text((100, y_start + 5), driver_info.get('from', '—'), 
                 fill='black', font=self.font_medium)
        
        draw.rectangle([(320, y_start), (600, y_start + 30)], outline='black')
        draw.text((325, y_start + 5), "To:", fill='black', font=self.font_medium)
        draw.text((370, y_start + 5), driver_info.get('to', '—'), 
                 fill='black', font=self.font_medium)
        
        # Carrier and Truck/Trailer
        y_start += 40
        draw.rectangle([(50, y_start), (400, y_start + 30)], outline='black')
        draw.text((55, y_start + 5), "Carrier:", fill='black', font=self.font_medium)
        draw.text((110, y_start + 5), driver_info.get('carrier', '—'), 
                 fill='black', font=self.font_medium)
        
        draw.rectangle([(420, y_start), (700, y_start + 30)], outline='black')
        draw.text((425, y_start + 5), "Truck/Trailer:", fill='black', font=self.font_medium)
        draw.text((520, y_start + 5), driver_info.get('truck', '—'), 
                 fill='black', font=self.font_medium)
    
    def _draw_grid(self, draw):
        """Draw the 24-hour grid with proper lines"""
        hours = 24
        hour_width = self.grid_width / hours
        
        # Status labels and rows
        statuses = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty\n(Not Driving)']
        status_height = self.grid_height / len(statuses)
        
        # Draw status labels
        for i, status in enumerate(statuses):
            y = self.grid_start_y + i * status_height
            draw.text((70, y + status_height/2), status, 
                     fill='black', anchor='lm', font=self.font_medium)
        
        # Draw horizontal lines (status boundaries)
        for i in range(len(statuses) + 1):
            y = self.grid_start_y + i * status_height
            draw.line([(self.grid_start_x, y), 
                      (self.grid_start_x + self.grid_width, y)], 
                     fill='black', width=2 if i == 0 or i == len(statuses) else 1)
        
        # Draw vertical lines (hour markers)
        for hour in range(25):
            x = self.grid_start_x + hour * hour_width
            
            # Main hour lines
            draw.line([(x, self.grid_start_y), 
                      (x, self.grid_start_y + self.grid_height)], 
                     fill='black' if hour % 6 == 0 else 'gray', 
                     width=2 if hour == 0 or hour == 24 else 1)
            
            # Hour labels
            if hour < 24:
                draw.text((x + hour_width/2, self.grid_start_y - 10), 
                         str(hour), fill='black', anchor='mm', font=self.font_small)
            
            # Draw 15-minute marks (lighter lines)
            if hour < 24:
                for quarter in range(1, 4):
                    x_quarter = x + (quarter * hour_width / 4)
                    draw.line([(x_quarter, self.grid_start_y), 
                              (x_quarter, self.grid_start_y + self.grid_height)], 
                             fill='lightgray', width=1)
    
    def _draw_duty_status_lines(self, draw, day_data):
        """Draw the actual duty status lines based on segments"""
        status_height = self.grid_height / 4
        hour_width = self.grid_width / 24
        
        # Status row indices
        status_rows = {
            'off_duty': 0,
            'sleeper_berth': 1,
            'driving': 2,
            'on_duty_not_driving': 3
        }
        
        # Get segments from day_data (or use defaults)
        segments = day_data.get('segments', [])
        
        if not segments:
            # Create default segments from totals
            segments = self._create_segments_from_totals(day_data)
        
        # Draw each segment
        for segment in segments:
            status = segment['status']
            start_hour = segment['start_hour']
            duration = segment['duration']
            
            if status in status_rows:
                row_idx = status_rows[status]
                y = self.grid_start_y + row_idx * status_height + status_height/2
                
                x_start = self.grid_start_x + start_hour * hour_width
                x_end = self.grid_start_x + (start_hour + duration) * hour_width
                
                # Draw thicker line for driving
                line_width = 4 if status == 'driving' else 3
                draw.line([(x_start, y), (x_end, y)], 
                         fill='green', width=line_width)
    
    def _create_segments_from_totals(self, day_data):
        """Create segments from total hours if segments not provided"""
        segments = []
        current_hour = 0
        
        # Off duty at start
        off_start = day_data.get('off_duty', 0)
        if off_start > 0:
            segments.append({
                'status': 'off_duty',
                'start_hour': current_hour,
                'duration': min(off_start, 8)
            })
            current_hour += min(off_start, 8)
        
        # On duty for pickup
        on_duty_pickup = day_data.get('on_duty_not_driving', 0)
        if on_duty_pickup > 0:
            segments.append({
                'status': 'on_duty_not_driving',
                'start_hour': current_hour,
                'duration': min(on_duty_pickup/2, 1)
            })
            current_hour += min(on_duty_pickup/2, 1)
        
        # Driving
        driving = day_data.get('driving', 0)
        if driving > 0:
            segments.append({
                'status': 'driving',
                'start_hour': current_hour,
                'duration': driving
            })
            current_hour += driving
        
        # On duty for dropoff
        if on_duty_pickup > 1:
            segments.append({
                'status': 'on_duty_not_driving',
                'start_hour': current_hour,
                'duration': min(on_duty_pickup/2, 1)
            })
            current_hour += min(on_duty_pickup/2, 1)
        
        # Sleeper berth if any
        sleeper = day_data.get('sleeper_berth', 0)
        if sleeper > 0:
            segments.append({
                'status': 'sleeper_berth',
                'start_hour': current_hour,
                'duration': sleeper
            })
            current_hour += sleeper
        
        # Fill remaining with off duty
        if current_hour < 24:
            segments.append({
                'status': 'off_duty',
                'start_hour': current_hour,
                'duration': 24 - current_hour
            })
        
        return segments
    
    def _draw_totals(self, draw, day_data):
        """Draw the totals section"""
        y_start = self.grid_start_y + self.grid_height + 40
        x_start = self.grid_start_x + self.grid_width - 200
        
        draw.text((x_start, y_start), "TOTAL HOURS", 
                 fill='black', font=self.font_medium)
        
        y_start += 25
        totals = [
            ('Off Duty:', day_data.get('off_duty', 0)),
            ('Sleeper:', day_data.get('sleeper_berth', 0)),
            ('Driving:', day_data.get('driving', 0)),
            ('On Duty:', day_data.get('on_duty_not_driving', 0))
        ]
        
        for label, hours in totals:
            draw.text((x_start, y_start), f"{label} {hours:.1f}", 
                     fill='black', font=self.font_small)
            y_start += 20
    
    def _draw_remarks(self, draw, day_data):
        """Draw the remarks section"""
        y_start = self.grid_start_y + self.grid_height + 40
        
        # Draw remarks box
        draw.rectangle([(50, y_start), (self.grid_start_x + self.grid_width - 250, y_start + 100)], 
                      outline='black')
        draw.text((55, y_start + 5), "REMARKS:", fill='black', font=self.font_medium)
        
        # Add any remarks from day_data
        remarks = day_data.get('remarks', [])
        y_offset = 25
        for remark in remarks[:3]:  # Limit to 3 remarks
            draw.text((60, y_start + y_offset), remark, 
                     fill='black', font=self.font_small)
            y_offset += 20