import { describe, it, expect } from 'vitest';

describe('Routing Engine (OSRM)', () => {
  it('should return a valid route between two coordinates in Florence', async () => {
    // Florence Duomo to Railway Station
    const start = [11.255, 43.773]; 
    const end = [11.248, 43.776];
    
    const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();

    expect(data.code).toBe('Ok');
    expect(data.routes.length).toBeGreaterThan(0);
  });

  it('should fail gracefully for unreachable coordinates', async () => {
    // Middle of Pacific Ocean to Middle of Sahara Desert
    const start = [-140.0, -20.0];
    const end = [20.0, 25.0];
    
    const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}`;
    const res = await fetch(url);
    const data = await res.json();

    // Most OSRM instances return 'NoRoute' for this
    expect(data.code).not.toBe('Ok');
  });
});
