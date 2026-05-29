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

describe('Booking Routes', () => {
  test('POST /api/bookings — user can create', async () => {
    const res = await request(app).post('/api/bookings').set(userAuth())
      .send({ room_id: 2, check_in: '2025-06-01', check_out: '2025-06-03', guests: 2 });
    expect(res.status).toBe(201);
    expect(res.body.total_price).toBeDefined();
  });

  test('POST /api/bookings — unauthenticated fails', async () => {
    const res = await request(app).post('/api/bookings')
      .send({ room_id: 1, check_in: '2025-06-01', check_out: '2025-06-03' });
    expect(res.status).toBe(401);
  });

  test('POST /api/bookings — missing fields', async () => {
    const res = await request(app).post('/api/bookings').set(userAuth()).send({ room_id: 1 });
    expect(res.status).toBe(400);
  });

  test('POST /api/bookings — checkout before checkin', async () => {
    const res = await request(app).post('/api/bookings').set(userAuth())
      .send({ room_id: 1, check_in: '2025-06-05', check_out: '2025-06-03' });
    expect(res.status).toBe(400);
  });

  test('GET /api/bookings — admin list', async () => {
    const res = await request(app).get('/api/bookings').set(adminAuth());
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/bookings — non-admin forbidden', async () => {
    const res = await request(app).get('/api/bookings').set(userAuth());
    expect(res.status).toBe(403);
  });

  test('PUT /api/bookings/:id — admin confirm', async () => {
    const res = await request(app).put('/api/bookings/1').set(adminAuth()).send({ status: 'confirmed' });
    expect(res.status).toBe(200);
  });

  test('PUT /api/bookings/:id — user cannot confirm', async () => {
    const res = await request(app).put('/api/bookings/1').set(userAuth()).send({ status: 'confirmed' });
    expect(res.status).toBe(403);
  });

  test('PUT /api/bookings/:id — user can cancel', async () => {
    const res = await request(app).put('/api/bookings/1').set(userAuth()).send({ status: 'cancelled' });
    expect(res.status).toBe(200);
  });

  test('PUT /api/bookings/:id — invalid status', async () => {
    const res = await request(app).put('/api/bookings/1').set(adminAuth()).send({ status: 'bad' });
    expect(res.status).toBe(400);
  });

  test('DELETE /api/bookings/:id — admin delete', async () => {
    const res = await request(app).delete('/api/bookings/1').set(adminAuth());
    expect(res.status).toBe(200);
  });
});
