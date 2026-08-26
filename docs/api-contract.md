# API Contract - GET /api/risk

```json
{
  "generated_at": "2026-08-23T14:00:00Z",
  "locations": [
    {
      "id": "loc_01",
      "name": "District A",
      "lat": 17.3850,
      "lon": 78.4867,
      "current": {
        "temp_c": 42.5,
        "humidity_pct": 38,
        "wind_kmh": 9.2,
        "solar_radiation": 780,
        "heat_index_c": 47.2
      },
      "demographics": {
        "elderly_pct": 12.4,
        "outdoor_worker_pct": 22.0
      },
      "risk": {
        "score": 78,
        "category": "High",
        "category_color": "#F96167"
      },
      "forecast": [
        { "time": "2026-08-23T15:00:00Z", "heat_index_c": 48.1, "risk_category": "High" }
      ]
    }
  ],
  "alerts": [
    {
      "location_id": "loc_01",
      "message": "Extreme heat risk - avoid outdoor exposure 12-4pm",
      "issued_at": "2026-08-23T14:00:00Z",
      "severity": "High"
    }
  ]
}
```

## Other endpoints
- GET /api/risk/<location_id> - same shape as one entry in locations above
- GET /api/alerts - returns just the alerts array

## Risk category enum
Low | Moderate | High | Extreme
