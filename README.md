# OpenTrack: Professional Fleet Intelligence

A high-performance, real-time fleet tracking and management platform built with Next.js, MapLibre, and PostGIS.

## 🚀 Key Features
- **60FPS Real-time Gliding**: Smooth vehicle movement using interpolation.
- **Navigator Engine**: Global routing (OSRM) and geocoding (Nominatim/Photon) with autocomplete.
- **Data Vault**: High-frequency GPS ingestion via PostGIS-enabled PostgreSQL.
- **Commercial Security**: Secured Ingestion API with X-API-Key validation.
- **Dark-Mode Aesthetic**: Premium Glassmorphism UI with high-fidelity dark matter maps.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15, Tailwind CSS, Lucide Icons.
- **Mapping**: MapLibre GL JS, PMTiles (Zero Mapping Cost), CartoDB Dark Matter.
- **Backend**: Next.js API Routes, Prisma ORM, Socket.io.
- **Database**: PostgreSQL + PostGIS (Docker).

## 🚦 Getting Started

### 1. Database Setup
```bash
docker-compose up -d
cp .env.local .env
npx prisma db push
```

### 2. Run the Environment
```bash
npm run dev           # Next.js Dashboard
npm run live:server   # WebSocket Engine
npm run live:mock     # Vehicle Simulator
```

## 🛰️ Commercial API
Integrate your fleet using our secured ingestion endpoint:
- **Endpoint**: `POST /api/v1/track`
- **Header**: `x-api-key: <YOUR_KEY>`
- **Docs**: See [API Tracking Guide](docs/api-guide.md)

## 🧪 Testing (TDD)
We maintain high stability through automated testing:
- **Unit Tests**: `npm test` (Vitest)
- **E2E Tests**: `npx playwright test` (Auth, Routing, Fleet Filtering)

---

Developed with ❤️ for OpenSource Logistics.
