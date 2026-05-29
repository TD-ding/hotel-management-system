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

describe('Notification Routes', () => {
  test('GET /api/notifications/my', async () => {
    const res = await request(app).get('/api/notifications/my').set(userAuth());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/notifications/my — unauthenticated', async () => {
    const res = await request(app).get('/api/notifications/my');
    expect(res.status).toBe(401);
  });

  test('GET /api/notifications/my/unread', async () => {
    const res = await request(app).get('/api/notifications/my/unread').set(userAuth());
    expect(res.status).toBe(200);
    expect(res.body.count).toBeDefined();
  });

  test('PUT /api/notifications/my/read', async () => {
    const res = await request(app).put('/api/notifications/my/read').set(userAuth());
    expect(res.status).toBe(200);
  });

  test('POST /api/notifications — admin send', async () => {
    const res = await request(app).post('/api/notifications').set(adminAuth())
      .send({ user_id: 2, message: 'Test' });
    expect(res.status).toBe(201);
  });

  test('POST /api/notifications — non-admin forbidden', async () => {
    const res = await request(app).post('/api/notifications').set(userAuth())
      .send({ user_id: 2, message: 'Hack' });
    expect(res.status).toBe(403);
  });

  test('POST /api/notifications — missing fields', async () => {
    const res = await request(app).post('/api/notifications').set(adminAuth())
      .send({ message: 'No user' });
    expect(res.status).toBe(400);
  });
});
