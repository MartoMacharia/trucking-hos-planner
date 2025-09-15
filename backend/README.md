# Trucking HOS Planner – Backend (Django + DRF)

REST API that calculates a trip with Hours-of-Service (HOS) compliance and generates ELD log sheets as base64 PNG images.

## Features
- Endpoints
  - `POST /api/calculate-trip/` – returns route info, HOS-compliant stops, and ELD log sheets
  - `GET /api/health/` – health check
  - API docs: `/api/swagger/` and `/api/redoc/`
- HOS planning (70hr/8day, 11hr drive, 14hr duty, 30-min break after 8)
- ELD log generation using Pillow
- CORS enabled for frontend

## Tech Stack
- Django 4 + Django REST Framework
- drf-spectacular (OpenAPI docs)
- Pillow for image generation
- Whitenoise for static files

## Local Setup
### Prerequisites
- Python 3.11 (or 3.10+)
- pip

### Install
```
cd backend
python -m venv venv
venv/Scripts/activate  # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python manage.py migrate
```

### Environment variables
Create `backend/.env` (optional) to override defaults:
```
DEBUG=True
ALLOWED_HOSTS=*
```

### Run
```
python manage.py runserver
```
API is available at `http://localhost:8000`. Docs at `http://localhost:8000/api/swagger/`.

## API
### Request: POST /api/calculate-trip/
```
{
  "current_location": "New York, NY",
  "pickup_location": "Philadelphia, PA",
  "dropoff_location": "Washington, DC",
  "current_cycle_hours": 20.5
}
```

### Response (shape)
```
{
  "route": { "points": [{"lat": 40.7, "lng": -74.0}, ...], "total_distance": 225 },
  "stops": [ {"type": "rest"|"fuel"|"break"|"pickup"|"dropoff", "duration": 30, ...} ],
  "log_sheets": [ { "day": 1, "date": "2025-01-01", "log_image": "<base64>" } ],
  "total_distance": 225,
  "total_time": 6.1,
  "fuel_stops": []
}
```

## Deploy (Render or Railway)
These steps assume your repo is on GitHub.

### Option A – Render (recommended quick start)
1. Create a new Web Service.
2. Connect your GitHub repo; pick the `backend/` folder.
3. Environment:
   - Build Command: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - Start Command: `gunicorn trucking_hos.wsgi:application --preload --log-file - --bind 0.0.0.0:$PORT`
   - Python version: 3.11
   - Add env vars as needed (`DEBUG=False`, `ALLOWED_HOSTS=*`).
4. After deploy, note the URL (e.g. `https://your-api.onrender.com`). Put this URL in the frontend `.env` as `REACT_APP_API_BASE_URL`.

### Option B – Railway
1. New Project → Deploy from GitHub.
2. Set root to `backend/`.
3. Add variables as above; Start Command same as Render.

## CORS
In `backend/trucking_hos/settings.py`, update:
```
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://your-frontend.vercel.app",
]
```

## Notes
- `RouteCalculator` returns mocked points by default; you can wire it to real routing later.
- The log drawer focuses on a clean 24-hour grid with 15-minute divisions. Provide exact duty segments to render precise lines.

## Troubleshooting
- 500 errors: check server logs. Ensure `ALLOWED_HOSTS` includes your domain.
- CORS: add your frontend origin to `CORS_ALLOWED_ORIGINS`.
- Pillow font warnings: the drawer falls back to default font if `arial.ttf` is missing.

## License
For assessment/demo purposes. Replace with your preferred license as needed. 