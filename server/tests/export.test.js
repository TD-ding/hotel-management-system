const request = require('supertest');
const { createTestDb, seedTestDb, cleanupDb, adminAuth, userAuth, getAdminToken, mockGetDb } = require('./setup');

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

describe('Export Routes', () => {
  test('GET /api/export/bookings — no auth fails', async () => {
    const res = await request(app).get('/api/export/bookings');
    expect(res.status).toBe(401);
  });

  test('GET /api/export/users — admin with token param', async () => {
    const token = getAdminToken();
    const res = await request(app).get(`/api/export/users?token=${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
  });

  test('GET /api/export/rooms — admin with token param', async () => {
    const token = getAdminToken();
    const res = await request(app).get(`/api/export/rooms?token=${token}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
  });
});

describe('Stats Route', () => {
  test('GET /api/stats — admin view', async () => {
    const res = await request(app).get('/api/stats').set(adminAuth());
    expect(res.status).toBe(200);
    expect(res.body.totalUsers).toBeDefined();
    expect(res.body.checkedInBookings).toBeDefined();
    expect(res.body.checkedOutBookings).toBeDefined();
  });

  test('GET /api/stats — unauthenticated fails', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(401);
  });
});

describe('Upload Route', () => {
  test('POST /api/upload — unauthenticated', async () => {
    const res = await request(app).post('/api/upload');
    expect(res.status).toBe(401);
  });

  test('POST /api/upload — non-admin forbidden', async () => {
    const res = await request(app).post('/api/upload').set(userAuth());
    expect(res.status).toBe(403);
  });
});
