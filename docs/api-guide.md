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

## 🏗️ Enterprise Hub

### 🪝 Real-time Webhooks
OpenTrack can push events directly to your backend.
*   `geofence.entry`: Triggered when a unit enters a restricted zone.
*   `geofence.exit`: Triggered when a unit leaves a zone.
*   `speeding.alert`: (Story 10) Triggered for dangerous driving.

### 📋 Asset Management
Manage vehicle metadata (Drivers, Models, License Plates) via `v1/assets`.

---

## 👨‍💻 Developer Portal
For interactive code examples and live testing, access the portal:
`http://localhost:3000/developer`

> [!TIP]
> Use our **NPM SDK** (coming soon) for faster integration in Node.js environments.
