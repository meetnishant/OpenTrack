import { test, expect, beforeAll } from 'vitest';
import { redis } from '../../src/lib/redis';

const BASE_URL = 'http://localhost:3000/api/v1';

test('Enterprise API: Asset Registration (v1/assets)', async () => {
  const testAsset = {
    id: 'TEST-ENT-01',
    model: 'Tesla Semi',
    licensePlate: 'UP-70-AB-1234',
    driverName: 'Nishant',
    capacity: 20000
  };

  const res = await fetch(`${BASE_URL}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testAsset)
  });

  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.id).toBe(testAsset.id);
  expect(data.driverName).toBe(testAsset.driverName);
});

test('Enterprise API: Redis-Backed Fleet Status (v1/fleet)', async () => {
  // 1. Mock a vehicle update into the Live Engine (which updates Redis)
  // For this test, we check if the endpoint returns a valid response
  const res = await fetch(`${BASE_URL}/fleet`);
  expect(res.status).toBe(200);
  
  const data = await res.json();
  expect(data).toHaveProperty('source');
  expect(['cache', 'db']).toContain(data.source);
});

test('Enterprise API: Analytics Retrieval (v1/analytics)', async () => {
  const res = await fetch(`${BASE_URL}/analytics?days=1`);
  expect(res.status).toBe(200);
  
  const data = await res.json();
  expect(data).toHaveProperty('summary');
  expect(data).toHaveProperty('daily');
});
