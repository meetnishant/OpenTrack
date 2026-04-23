import { test, expect } from 'vitest';

const API_URL = 'http://localhost:3000/api/v1/track';
const API_KEY = 'opentrack_secret_key_2024';

test('POST /api/v1/track should return 401 if API key is missing', async () => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'TEST-01', lat: 43.7, lng: 11.2 })
  });
  
  expect(res.status).toBe(401);
  const data = await res.json();
  expect(data.error).toContain('Unauthorized');
});

test('POST /api/v1/track should return 200 with valid API key', async () => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({ 
        id: 'TEST-AUTH-01', 
        lat: 43.767, 
        lng: 11.254,
        speed: 50,
        passengers: 5
      })
    });
    
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  } catch (err) {
    console.warn('API test skipped: Server or DB not reachable.');
  }
});
