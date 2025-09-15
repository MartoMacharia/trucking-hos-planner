from PIL import Image, ImageDraw, ImageFont
from datetime import datetime, timedelta
import io
import base64

class LogSheetDrawer:
    """
    Minimal ELD sheet drawer focused on a 24-hour grid with 15-minute divisions
    and four duty statuses (Off Duty, Sleeper Berth, Driving, On Duty (Not Driving)).
    """
    
    def __init__(self):
        self.width = 1200
        self.height = 800
        self.margin = 40
        self.grid_start_x = 120
        self.grid_start_y = 140
        self.grid_width = 1000
        self.grid_height = 480
        self.font = None
        self.small_font = None
        try:
            self.font = ImageFont.truetype("arial.ttf", 18)
            self.small_font = ImageFont.truetype("arial.ttf", 14)
        except Exception:
            self.font = None
            self.small_font = None
        
    def draw_log_sheet(self, day_data, date, driver_info):
        img = Image.new('RGB', (self.width, self.height), 'white')
        draw = ImageDraw.Draw(img)

        self._draw_title(draw, date)
        self._draw_grid_with_quarters(draw)
        self._draw_duty_status(draw, day_data)

        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return {
            'image': img_str,
            'date': date.isoformat()
        }

    def _draw_title(self, draw, date):
        draw.text((self.width // 2, 30), "DRIVER'S DAILY LOG", fill='black', anchor='mm', font=self.font)
        draw.text((self.width // 2, 60), "(24 HOURS)", fill='black', anchor='mm', font=self.small_font)
        draw.text((self.width // 2, 90), f"Date: {date.strftime('%Y-%m-%d')}", fill='black', anchor='mm', font=self.small_font)

    def _draw_grid_with_quarters(self, draw):
        hours = 24
        quarters_per_hour = 4
        quarter_count = hours * quarters_per_hour  # 96 intervals
        quarter_width = self.grid_width / quarter_count
        status_labels = ['Off Duty', 'Sleeper Berth', 'Driving', 'On Duty (Not Driving)']
        status_height = self.grid_height / len(status_labels)

        # Horizontal lines and labels
        for i, label in enumerate(status_labels):
            y = self.grid_start_y + i * status_height
            draw.line([(self.grid_start_x, y), (self.grid_start_x + self.grid_width, y)], fill='black', width=1)
            draw.text((60, y + status_height/2), label, fill='black', anchor='lm', font=self.small_font)
        # Bottom border
        draw.line([(self.grid_start_x, self.grid_start_y + self.grid_height), (self.grid_start_x + self.grid_width, self.grid_start_y + self.grid_height)], fill='black', width=1)

        # Vertical lines: hour and quarter ticks
        for q in range(quarter_count + 1):
            x = self.grid_start_x + q * quarter_width
            is_hour = (q % quarters_per_hour == 0)
            color = 'gray'
            width = 1
            draw.line([(x, self.grid_start_y), (x, self.grid_start_y + self.grid_height)], fill=color, width=width)
            # Hour labels on top
            if is_hour and q < quarter_count:
                hour = q // quarters_per_hour
                draw.text((x + quarter_width * 2, self.grid_start_y - 14), str(hour), fill='black', anchor='mm', font=self.small_font)

    def _draw_duty_status(self, draw, day_data):
        # Render simple blocks based on totals to cover the 24h period.
        # If exact segments are provided later, we will draw precise lines.
        status_height = self.grid_height / 4
        def x_at_hour(hour):
            return self.grid_start_x + (hour / 24.0) * self.grid_width
        def y_for_row(idx):
            return self.grid_start_y + idx * status_height + status_height/2

        driving = float(day_data.get('driving', 0))
        on_duty = float(day_data.get('on_duty_not_driving', 0))
        sleeper = float(day_data.get('sleeper_berth', 0))
        off = float(day_data.get('off_duty', 0))
        # Ensure full 24 hours coverage
        total = driving + on_duty + sleeper + off
        if total == 0:
            off = 24.0
            total = 24.0
        if total < 24.0:
            off += 24.0 - total
        # Draw in order: Off (0), Sleeper (1), Driving (2), OnDuty (3)
        t = 0.0
        def draw_block(duration, row_idx, width=3):
            nonlocal t
            if duration <= 0: 
                return
            x1 = x_at_hour(t)
            t += duration
            x2 = x_at_hour(min(24.0, t))
            y = y_for_row(row_idx)
            draw.line([(x1, y), (x2, y)], fill='black', width=width)
        draw_block(off, 0)
        draw_block(sleeper, 1)
        draw_block(driving, 2, width=4)
        draw_block(on_duty, 3)