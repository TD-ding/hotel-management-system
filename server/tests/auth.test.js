const request = require('supertest');
const { createTestDb, seedTestDb, cleanupDb, adminAuth, mockGetDb } = require('./setup');

jest.mock('../src/db', () => mockGetDb());

let db;
let app;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret-key';
  db = createTestDb();
  await seedTestDb(db);
  app = require('../src/index');
});

afterAll(() => {
  cleanupDb(db);
});

describe('Auth Routes', () => {
  test('POST /api/auth/register — success', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newuser', email: 'new@test.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.username).toBe('newuser');
  });

  test('POST /api/auth/register — missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'x' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/register — duplicate username', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'admin', email: 'other@test.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  test('POST /api/auth/register — password too short', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'shortpw', email: 'short@test.com', password: '123' });
    expect(res.status).toBe(400);
  });

  test('POST /api/auth/login — success', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('POST /api/auth/login — wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/login — non-existent user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nobody', password: 'password123' });
    expect(res.status).toBe(401);
  });

  test('GET /api/auth/me — with valid admin token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set(adminAuth());
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('admin');
  });

  test('GET /api/auth/me — no token', async () => {
    const res = await request(app)
      .get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
