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

describe('User Routes', () => {
  test('GET /api/users — admin list', async () => {
    const res = await request(app).get('/api/users').set(adminAuth());
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
  });

  test('GET /api/users — non-admin forbidden', async () => {
    const res = await request(app).get('/api/users').set(userAuth());
    expect(res.status).toBe(403);
  });

  test('PUT /api/users/me — update profile', async () => {
    const res = await request(app).put('/api/users/me').set(userAuth())
      .send({ username: 'demo_updated', email: 'updated@test.com' });
    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('demo_updated');
  });

  test('PUT /api/users/me/password — wrong old password', async () => {
    const res = await request(app).put('/api/users/me/password').set(userAuth())
      .send({ old_password: 'wrong', new_password: 'newpass123' });
    expect(res.status).toBe(401);
  });

  test('PUT /api/users/me/password — too short', async () => {
    const res = await request(app).put('/api/users/me/password').set(userAuth())
      .send({ old_password: 'user123', new_password: '12' });
    expect(res.status).toBe(400);
  });

  test('DELETE /api/users/:id — cannot delete admin', async () => {
    const res = await request(app).delete('/api/users/1').set(adminAuth());
    expect(res.status).toBe(403);
  });
});
