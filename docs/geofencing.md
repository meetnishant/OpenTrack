# OpenTrack Geofencing & Alerts

The Geofencing system provides automated perimeter security for your fleet, enabling real-time detection of boundary violations in your service area.

## 📐 Creating Safety Zones
1.  **Select the Polygon Tool**: Click the polygon icon in the top-right corner of the map.
2.  **Draw the Area**: Click on the map to define the corners of your zone. Double-click to close the polygon.
3.  **Active Monitoring**: As soon as a zone is completed, it appears in the **Alerts** tab in the sidebar and starts monitoring all active vehicles.

## 🚨 Alerts & Notifications
The system uses **Turf.js** for high-precision spatial analysis on the client-side.

### Violation Types
*   **Entry Alert**: Triggered the moment a vehicle's GPS coordinate moves inside an active geofence.
*   **Exit Alert**: Triggered when a vehicle that was inside a geofence moves outside its boundaries.

### Browser Push Notifications
*   **Real-time Toasts**: If browser notifications are enabled, you will receive an OS-level notification even if the OpenTrack tab is not focused.
*   **Deep Linking**: Notifications include the vehicle ID and zone details for immediate context.

## 🛠️ Technical Implementation
*   **Spatial Engine**: Powered by `@turf/turf`.
*   **Drawing Library**: Integrated `@mapbox/mapbox-gl-draw` (adapted for MapLibre).
*   **Optimization**: State-based transition tracking prevents redundant alerts (only triggers on the actual crossing event).
