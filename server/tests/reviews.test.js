const request = require('supertest');
const { createTestDb, seedTestDb, cleanupDb, userAuth, mockGetDb } = require('./setup');

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

describe('Review Routes', () => {
  test('GET /api/reviews/room/:roomId', async () => {
    const res = await request(app).get('/api/reviews/room/1');
    expect(res.status).toBe(200);
    expect(res.body.reviews).toBeDefined();
  });

  test('POST /api/reviews — user with booking', async () => {
    const res = await request(app).post('/api/reviews').set(userAuth())
      .send({ room_id: 1, rating: 4, comment: 'Good' });
    expect(res.status).toBe(201);
  });

  test('POST /api/reviews — duplicate rejected', async () => {
    const res = await request(app).post('/api/reviews').set(userAuth())
      .send({ room_id: 1, rating: 3 });
    expect(res.status).toBe(409);
  });

  test('POST /api/reviews — no booking rejected', async () => {
    const res = await request(app).post('/api/reviews').set(userAuth())
      .send({ room_id: 2, rating: 5 });
    expect(res.status).toBe(403);
  });

  test('POST /api/reviews — invalid rating', async () => {
    const res = await request(app).post('/api/reviews').set(userAuth())
      .send({ room_id: 1, rating: 6 });
    expect(res.status).toBe(400);
  });

  test('POST /api/reviews — unauthenticated', async () => {
    const res = await request(app).post('/api/reviews').send({ room_id: 1, rating: 5 });
    expect(res.status).toBe(401);
  });
});
