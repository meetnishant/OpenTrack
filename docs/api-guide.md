# 🔌 OpenTrack API Engine v1.0

OpenTrack is an **API-First** fleet intelligence engine. This guide provides technical specifications for integrating our real-time telemetry, spatial analysis, and historical data into your enterprise applications.

---

## 🔑 Authentication & Security

### Demo Mode
In development, authentication is handled via session cookies. Ensure your client supports cookie persistence.

### Production (API Keys)
Requests must include the `X-API-KEY` header.
> [!IMPORTANT]
> Keep your API keys secure. If compromised, rotate them immediately in the Developer Settings.

---

## 📡 Live Telemetry

### 🛰️ Ingest GPS Data
`POST /api/v1/track`
The primary endpoint for hardware devices and mobile apps.

**Payload Specification:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `vehicleId` | String | Yes | Unique ID (e.g., VIN or License Plate) |
| `lat` | Float | Yes | Latitude (-90 to 90) |
| `lng` | Float | Yes | Longitude (-180 to 180) |
| `speed` | Float | No | Speed in km/h |
| `heading` | Float | No | 0-360 degrees |

### ❄️ Fleet Snapshot (Redis)
`GET /api/v1/fleet`
Returns a high-speed JSON snapshot of the entire fleet. Powered by **Redis**, this endpoint typically responds in <1ms.

---

## 🕰️ Historical Analysis

### 🎞️ Time-Series Playback
`GET /api/v1/history/[id]`
Retrieves a GeoJSON LineString of a vehicle's path.

**Sample Request:**
`GET /api/v1/history/V-101?days=7`

---

## 🏗️ Enterprise Integration APIs

### 🪝 Real-time Webhooks
`POST /api/v1/webhooks`
OpenTrack pushes JSON events directly to your backend.
*   `location.updated`: Triggered on every telemetry point.
*   `batch.ingested`: Triggered when an offline data dump is successfully parsed.
*   `geofence.entry`: Triggered when a unit enters a restricted zone.

### 📦 Batch Telemetry Ingestion
`POST /api/v1/track/batch`
Upload massive arrays of GPS coordinates when IoT gateways recover from network dead zones.
*   **Payload**: Array of telemetry objects.
*   **Action**: Performs high-performance bulk database upserts via Prisma.

### 🔐 API Key Management
`POST /api/v1/keys`
Provision cryptographically secure, scope-based keys (`read`, `write`, `admin`) for B2B API access.

### 🗺️ Dynamic Dispatching (Distance Matrix)
`POST /api/v1/routing/matrix`
Provide an origin and an array of `vehicleIds`. OSRM dynamically calculates the real-time ETA for *every* vehicle simultaneously and identifies the fastest responder.

### 📥 Historical Data Export
`GET /api/v1/export?vehicleId=V-100&date=YYYY-MM-DD`
Bypass dashboards and pipe raw telemetry directly into your own data lakes.
*   **Formats**: `json` or fully valid `geojson` (for direct map rendering).

---

## 👨‍💻 Developer Portal
For interactive code examples and live testing, access the portal:
`http://localhost:3000/developer`

> [!TIP]
> Use our **NPM SDK** (coming soon) for faster integration in Node.js environments.
