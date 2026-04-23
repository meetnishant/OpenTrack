# Map Infrastructure Setup (PMTiles) 🗺️

OpenTrack uses **PMTiles** to serve vector map data without a dedicated tile server.

## How it Works
1. **The Data Container**: All map data (roads, buildings, water) for a region is packed into a single `.pmtiles` archive.
2. **The Protocol**: The browser uses the `pmtiles://` custom protocol registered in MapLibre.
3. **The Fetch**: When you move the map, the browser uses **HTTP Range Requests** to download only the specific byte-ranges of the file needed for that view.

## Steps to Self-Host Your Region

### 1. Download OpenStreetMap Data
Get the `.osm.pbf` file for your chosen region from [Geofabrik](https://download.geofabrik.de/).
Example: `monaco-latest.osm.pbf`.

### 2. Convert to PMTiles
Use **Planetiler** (requires Java) to convert the raw data into vector tiles:
```bash
java -jar planetiler.jar --download --area=monaco --output=monaco.pmtiles
```

### 3. Deploy
Upload the resulting `monaco.pmtiles` to:
- A static web server (Nginx/Apache).
- An S3-compatible storage bucket (AWS S3, Cloudflare R2).

### 4. Configure the UI
In `src/components/MapComponent.tsx`, update the source URL:
```typescript
url: `pmtiles://https://your-domain.com/maps/monaco.pmtiles`
```

## Troubleshooting
- **CORS**: Ensure your hosting provider allows `Origin` and `Range` headers.
- **Protocol**: Always ensure `pmtiles.Protocol` is registered with `maplibregl.addProtocol` before initializing the map.
