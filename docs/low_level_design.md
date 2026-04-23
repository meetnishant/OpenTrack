# Low-Level Design (LLD) - OpenTrack 🛠️

This document provides a deep dive into the implementation details of the OpenTrack system.

## 1. GPS Ingestion Service (The "Listener")
This service handles high-frequency POST requests from vehicles.

### Data Validation Pipe
- **Rate Limiting**: Limit each `vehicle_id` to 1 ping per second to prevent DDoS/Buggy hardware.
- **Input Sanitization**: 
    - Coordinates must be within `[-180, 180]` and `[-90, 90]`.
    - Speed must be non-negative.
- **Queueing**: If traffic spikes, use a lightweight queue (e.g., Redis) before writing to PostgreSQL to prevent DB locking.

### Logic Flow
1. Receive `POST /api/v1/track`.
2. Extract `vehicle_id`, `lat`, `lng`, `speed`, `passengers`.
3. Create PostGIS Point: `ST_SetSRID(ST_MakePoint(lng, lat), 4326)`.
4. Insert into `coordinates` table.
5. Push payload to WebSocket Hub for live UI broadcast.

---

## 2. Spatial Database Design (PostGIS)

### Indices
- **Spatial Index**: `CREATE INDEX idx_coords_geom ON coordinates USING GIST (geom);` (Essential for "Who is near me?" queries).
- **Time Index**: `CREATE INDEX idx_coords_time ON coordinates (created_at DESC);` (Essential for Route Replay).
- **Foreign Key Index**: `CREATE INDEX idx_coords_vehicle ON coordinates (vehicle_id);`.

### Cleanup Strategy (Retention)
Historical GPS data can grow to millions of rows daily.
- **Partitioning**: Partition the `coordinates` table by **Day** or **Week**.
- **Cold Storage**: Move data older than 30 days to a compressed archival table or S3.

---

## 3. WebSocket Protocol (Real-time Sync)
The UI connects to `/ws/fleet`.

**Message Structure (Server to Client):**
```json
{
  "type": "VEHICLE_UPDATE",
  "payload": {
    "id": "v-102",
    "pos": [lng, lat],
    "speed": 62,
    "passengers": 12,
    "heading": 180
  }
}
```

---

## 4. Frontend Map Controller (MapLibre)

### Source & Layer Management
- **Base Map**: Load PMTiles via the `protomaps-leaflet` or `pmtiles` protocol.
- **Vehicle Layer**: Use a `GeoJSON Source`.
- **Optimization**: Do not re-render the whole GeoJSON object on every update. Instead, use `source.setData()` or move individual markers via `marker.setLngLat()` if the fleet is small.

### Smooth Interpolation (The "Glide")
When a new GPS point arrives:
1. Don't teleport.
2. Use `requestAnimationFrame` to animate the icon from `Point A` to `Point B` over the estimated refresh interval (e.g., 2 seconds).

---

## 5. Geofence Engine (Alert Logic)

### Breach Detection
When a new coordinate `C` arrives for `Vehicle V`:
1. Fetch all active geofences for `Vehicle V`.
2. For each fence `F`:
   - Check `ST_Within(C.geom, F.zone_geom)`.
   - If state changed (e.g., was outside, now inside), trigger **WEBHOOK**.

### Webhook Payload
```json
{
  "event": "GEOFENCE_ENTRY",
  "vehicle_id": "v-102",
  "zone_id": "airport-zone",
  "timestamp": "2024-10-21T14:00:00Z"
}
```

---

## 6. Security Specification
- **JWT Auth**: All commercial API requests must include a Bearer Token.
- **TLS**: All GPS ingestion must happen over HTTPS (or MQTTS).
- **API Keys**: Commercial users generate scoped API keys (Read-only vs. Ingestion-only).
