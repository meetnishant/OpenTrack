import { describe, it, expect } from 'vitest';

describe('Routing Engine (OSRM)', () => {
  it('should return a valid route between two coordinates in Florence', async () => {
    // Florence Duomo to Railway Station
    const start = [11.255, 43.773]; 
    const end = [11.248, 43.776];
    
    const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
    
    const response = await fetch(url);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.routes).toBeDefined();
    expect(data.routes[0].geometry.type).toBe('LineString');
    expect(data.routes[0].distance).toBeGreaterThan(0);
  });

  it('should return a 404 for unreachable locations (if applicable)', async () => {
    // One point in the ocean
    const start = [0, 0];
    const end = [11.25, 43.77];
    
    const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}`;
    
    const response = await fetch(url);
    const data = await response.json();

    expect(data.code).toBe('InvalidUrl');
  });
});
