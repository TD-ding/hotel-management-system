const request = require('supertest');
const { createTestDb, seedTestDb, cleanupDb, adminAuth, userAuth, mockGetDb } = require('./setup');

jest.mock('../src/db', () => mockGetDb());

let db;
let app;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-key';
  db = createTestDb();
  await seedTestDb(db);
  app = require('../src/index');
});

afterAll(() => { cleanupDb(db); });

describe('Room Routes', () => {
  test('GET /api/rooms — returns room list', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
  });

  test('GET /api/rooms — pagination', async () => {
    const res = await request(app).get('/api/rooms?page=1&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(1);
  });

  test('GET /api/rooms/:id — returns room detail', async () => {
    const res = await request(app).get('/api/rooms/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBeDefined();
  });

  test('GET /api/rooms/:id — 404', async () => {
    const res = await request(app).get('/api/rooms/9999');
    expect(res.status).toBe(404);
  });

  test('GET /api/rooms/:id/booked-dates', async () => {
    const res = await request(app).get('/api/rooms/1/booked-dates?month=1&year=2025');
    expect(res.status).toBe(200);
    expect(res.body.bookedDates).toBeDefined();
  });

  test('POST /api/rooms — admin can create', async () => {
    const res = await request(app).post('/api/rooms').set(adminAuth())
      .send({ name: 'New', type: 'suite', price: 800, capacity: 4 });
    expect(res.status).toBe(201);
  });

  test('POST /api/rooms — missing fields', async () => {
    const res = await request(app).post('/api/rooms').set(adminAuth()).send({ name: 'X' });
    expect(res.status).toBe(400);
  });

  test('POST /api/rooms — unauthenticated', async () => {
    const res = await request(app).post('/api/rooms')
      .send({ name: 'R', type: 'standard', price: 100, capacity: 2 });
    expect(res.status).toBe(401);
  });

  test('DELETE /api/rooms/:id — cascade delete', async () => {
    const c = await request(app).post('/api/rooms').set(adminAuth())
      .send({ name: 'Del', type: 'standard', price: 100, capacity: 2 });
    const res = await request(app).delete(`/api/rooms/${c.body.id}`).set(adminAuth());
    expect(res.status).toBe(200);
  });
});
