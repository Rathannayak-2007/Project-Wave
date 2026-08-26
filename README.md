# Climate Stress Analytics Hub (CSAH)

An intelligent, formula-driven early-warning platform that computes Human Thermal
Stress and Mortality Risk Indices from live weather data and local demographics.

## Structure
- backend/  - Flask API, risk engine, weather service (NWS Heat Index formula)
- frontend/ - Leaflet map, Chart.js forecast, mock data for parallel dev
- docs/     - API contract and formula reference (read these first)

## Run the backend
1. cd backend
2. python -m venv venv
3. venv\Scripts\activate       (Windows)  |  source venv/bin/activate  (Mac/Linux)
4. pip install -r requirements.txt
5. copy .env.example to .env
6. python app.py
   -> API runs at http://localhost:5000

## Run the frontend
1. cd frontend
2. python -m http.server 8000
   -> Open http://localhost:8000 in your browser
   (fetch() needs a real server, not double-clicking index.html)
