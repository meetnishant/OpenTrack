# OpenTrack 🌍

**OpenTrack** is a high-performance, open-source GPS tracking platform designed for individual developers and commercial fleet operators. It solves the "Mapping Tax" by leveraging the **MapLibre + Protomaps** stack, allowing for total data sovereignty and zero-cost map hosting.

## 🚀 The Mission
To provide a commercial-grade tracking infrastructure that is:
1.  **Zero-Cost to Host**: Uses self-hosted vector tiles (PMTiles) instead of expensive Mapbox/Google APIs.
2.  **Hardware Agnostic**: Designed to receive data from custom IoT devices, mobile apps, or hardware trackers.
3.  **Real-Time Ready**: Built with WebSockets to handle thousands of moving assets at 60FPS.
4.  **Developer-First**: A clean, robust API for commercial integrations and fleet analytics.

## 🛠 Tech Stack

| Layer | Technology | Why? |
| :--- | :--- | :--- |
| **Map Rendering** | [MapLibre GL JS](https://maplibre.org/) | GPU-accelerated WebGL rendering for smooth vehicle motion. |
| **Map Data** | [Protomaps (PMTiles)](https://protomaps.com/) | Self-hosted vector maps based on OpenStreetMap. |
| **Frontend** | [Next.js](https://nextjs.org/) + Tailwind | Modern, responsive, and SEO-friendly dashboard. |
| **Database** | [PostgreSQL](https://www.postgresql.org/) + [PostGIS](https://postgis.net/) | Industry-standard for geospatial queries and indexing. |
| **Interchange** | [WebSockets](https://socket.io/) / MQTT | Low-latency updates (<100ms) from vehicle to map. |

## 📦 Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

*OpenTrack is currently in the Implementation phase.*
