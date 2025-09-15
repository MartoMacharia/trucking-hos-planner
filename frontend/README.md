# Trucking HOS Planner – Frontend (React)

A React single-page application that lets drivers plan a trip and view Hours-of-Service (HOS) compliant ELD log sheets.

## Features
- Trip input with location autocomplete (Nominatim) and browser geolocation
- Interactive map (Leaflet + OpenStreetMap)
- Client-side routed polyline using OpenRouteService (ORS)
- Calls backend API for trip calculation and ELD sheet generation
- Dedicated ELD Log screen that displays base64 images returned by the backend

## Tech Stack
- React (CRA)
- react-leaflet + Leaflet
- Tailwind-ready styles via existing CSS
- OpenStreetMap tiles + OpenRouteService directions

## Prerequisites
- Node.js 18+
- An OpenRouteService API key (free tier available)
- Backend running locally or deployed (see backend README)

## Environment Variables
Create a file named `.env` in `frontend/` with:

```
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ORS_API_KEY=YOUR_ORS_KEY
```

- `REACT_APP_API_BASE_URL` points to your Django server.
- `REACT_APP_ORS_API_KEY` is used to fetch client-side routes.

Restart `npm start` after changing env vars.

## Install & Run (Local)
```
cd frontend
npm install
npm start
```
The app will open at `http://localhost:3000`.

## Usage Tips
- Start typing locations, then CLICK a suggestion to set coordinates. Text-only input will not draw routes.
- After submitting the trip, click "View ELD Logs" to open the ELD screen.

## Build
```
npm run build
```
Outputs a production build in `build/`.

## Deploy (Vercel)
1. Push the repo to GitHub.
2. In Vercel, "New Project" → Import your repo → select `frontend/`.
3. Framework Preset: Create React App (or leave Auto)
4. Build command: `npm run build`
5. Output directory: `build`
6. Environment Variables:
   - `REACT_APP_API_BASE_URL` → your backend URL (e.g. `https://your-api.onrender.com`)
   - `REACT_APP_ORS_API_KEY` → your ORS key
7. Deploy.

## Folder Structure Highlights
- `src/components/TripInputForm.jsx`: Inputs and address suggestions
- `src/components/MapView.jsx`: Map, markers, route polyline (ORS)
- `src/components/LogSheets.jsx`: Renders base64 ELD images
- `src/services/api.js`: Calls the Django API
- `src/services/orsService.js`: ORS geocoding and directions helper

## Troubleshooting
- No route shown: ensure you selected suggestions, and `REACT_APP_ORS_API_KEY` is set. Check browser console for errors (401/403 means invalid key; 429 means rate limit).
- CORS errors: add your frontend URL to `CORS_ALLOWED_ORIGINS` in backend settings.

## License
For assessment/demo purposes. Replace with your preferred license as needed.
