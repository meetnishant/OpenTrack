# OpenTrack Tracking API Guide

The OpenTrack platform provides a high-frequency ingestion API designed for GPS hardware, mobile apps, and commercial fleet integrators.

## Endpoint: Ingest Tracking Data
**`POST /api/v1/track`**

### Security
All requests must include a valid API Key in the headers.
*   **Header Name**: `x-api-key`
*   **Default Key**: `opentrack_secret_key_2024` (Configurable in `.env.local`)

---

### Request Format (JSON)
```json
{
  "id": "BUS-102",
  "lat": 43.767,
  "lng": 11.254,
  "speed": 45.5,
  "passengers": 12,
  "heading": 185.0
}
```

### Field Definitions
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique identifier for the vehicle. |
| `lat` | `float` | Yes | WGS84 Latitude. |
| `lng` | `float` | Yes | WGS84 Longitude. |
| `speed` | `float` | No | Current speed in km/h. |
| `passengers` | `int` | No | Current occupancy count. |
| `heading` | `float` | No | Compass heading in degrees. |

### Example `curl` Request (Authorized)
```bash
curl -X POST http://localhost:3000/api/v1/track \
  -H "Content-Type: application/json" \
  -H "x-api-key: opentrack_secret_key_2024" \
  -d '{
    "id": "COMMERCIAL-01",
    "lat": 28.4125,
    "lng": 77.0400,
    "speed": 60,
    "passengers": 5,
    "heading": 90
  }'
```

### Error Responses
| Status | Code | Description |
| :--- | :--- | :--- |
| `401` | `Unauthorized` | Missing or invalid `x-api-key` header. |
| `400` | `Bad Request` | Missing required fields (`id`, `lat`, `lng`). |
| `500` | `Internal Error` | Database or connection failure. |
