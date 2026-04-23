# OpenTrack UI Features Guide

This guide covers the advanced interface features designed for high-end fleet management.

## 🗄️ Fleet Sidebar
The sidebar is the command center of the dashboard, providing instant access to your active fleet.

### Real-time Vehicle Listing
*   **Live Status**: Every vehicle in the list shows a pulsing "Live" indicator when updates are active.
*   **Metadata Glance**: View current speed and passenger occupancy without clicking.
*   **Automatic Sorting**: Vehicles are sorted by ID, but can be extended to sort by speed or distance.

### Search & Discovery
*   **Instant Filtering**: Type any part of a Vehicle ID to filter the list and the map markers simultaneously.
*   **Map Synchronization**: Clicking a vehicle in the sidebar triggers a high-speed "Fly-To" animation, focusing the map directly on the unit.

## 🗺️ Mapping Intelligence
The map component uses a hybrid rendering engine for maximum detail.

### 60FPS Gliding (Ghost in the Machine)
*   **Smooth Interpolation**: Instead of jumping between GPS pings, vehicles glide smoothly across the map.
*   **Directional Heading**: Vehicle icons are designed as pointers (triangles) that rotate to match the actual compass bearing of the unit.

### Global Vector Fallback
*   **Hyper-local Detail**: Uses Protomaps (PMTiles) for zero-cost vector data in pre-defined regions (e.g., Florence).
*   **Global Coverage**: Automatically falls back to high-quality CartoDB Dark Matter tiles for global context.

## 🚦 Navigation & Routing
*   **Multi-Address Routing**: Enter any start and end point to calculate driving directions via OSRM.
*   **Fuzzy Autocomplete**: Powered by Photon, the search bars provide suggestions even with minor typos (e.g., "eldeco" vs "eledco").
