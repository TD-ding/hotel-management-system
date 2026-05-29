const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware');

const router = express.Router();

router.get('/', (req, res) => {
  const { type, minPrice, maxPrice, capacity, available, search } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 50));
  const offset = (page - 1) * limit;
  let sql = 'SELECT * FROM rooms WHERE 1=1';
  let countSql = 'SELECT COUNT(*) as total FROM rooms WHERE 1=1';
  const params = [];
  const countParams = [];

  if (type) { sql += ' AND type = ?'; countSql += ' AND type = ?'; params.push(type); countParams.push(type); }
  if (minPrice) { sql += ' AND price >= ?'; countSql += ' AND price >= ?'; params.push(Number(minPrice)); countParams.push(Number(minPrice)); }
  if (maxPrice) { sql += ' AND price <= ?'; countSql += ' AND price <= ?'; params.push(Number(maxPrice)); countParams.push(Number(maxPrice)); }
  if (capacity) { sql += ' AND capacity >= ?'; countSql += ' AND capacity >= ?'; params.push(Number(capacity)); countParams.push(Number(capacity)); }
  if (available !== undefined) { sql += ' AND available = ?'; countSql += ' AND available = ?'; params.push(Number(available)); countParams.push(Number(available)); }
  if (search) { sql += ' AND name LIKE ?'; countSql += ' AND name LIKE ?'; params.push(`%${search}%`); countParams.push(`%${search}%`); }

  const total = db.prepare(countSql).get(...countParams).total;

  const rooms = db.prepare(
    `SELECT r.*, COALESCE(rv.avgRating, NULL) as avgRating, COALESCE(rv.reviewCount, 0) as reviewCount
     FROM (${sql}) r
     LEFT JOIN (
       SELECT room_id, ROUND(AVG(rating), 1) as avgRating, COUNT(*) as reviewCount
       FROM reviews GROUP BY room_id
     ) rv ON r.id = rv.room_id
     ORDER BY r.price ASC`
  ).all(...params);

  res.json({ data: rooms, total, page, limit, totalPages: Math.ceil(total / limit) });
});

router.get('/:id/booked-dates', (req, res) => {
  const { month, year } = req.query;
  const roomId = req.params.id;

  let m = month ? Number(month) : new Date().getMonth() + 1;
  let y = year ? Number(year) : new Date().getFullYear();
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
  const nextM = m === 12 ? 1 : m + 1;
  const nextY = m === 12 ? y + 1 : y;
  const endDate = `${nextY}-${String(nextM).padStart(2, '0')}-01`;

  const bookings = db.prepare(
    `SELECT check_in, check_out FROM bookings
     WHERE room_id = ? AND status != 'cancelled'
     AND check_out > ? AND check_in < ?
     ORDER BY check_in`
  ).all(roomId, startDate, endDate);

  const bookedDates = [];
  bookings.forEach(b => {
    const start = new Date(b.check_in + 'T00:00:00');
    const end = new Date(b.check_out + 'T00:00:00');
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      bookedDates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
  });

  res.json({ bookedDates, month: m, year: y });
});

router.get('/:id', (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) return res.status(404).json({ error: '房间不存在' });
  const avg = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE room_id = ?').get(room.id);
  res.json({ ...room, avgRating: avg.avg ? Number(avg.avg).toFixed(1) : null, reviewCount: avg.count });
});

router.post('/', auth, adminOnly, (req, res) => {
  const { name, type, price, capacity, description, image, amenities, available } = req.body;
  if (!name || !type || !price || !capacity) {
    return res.status(400).json({ error: '请填写所有必填字段' });
  }
  const result = db.prepare(
    'INSERT INTO rooms (name, type, price, capacity, description, image, amenities, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(name, type, price, capacity, description || '', image || '', amenities || '', available ?? 1);
  res.status(201).json({ id: result.lastInsertRowid, message: '房间创建成功' });
});

router.put('/:id', auth, adminOnly, (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) return res.status(404).json({ error: '房间不存在' });

  const { name, type, price, capacity, description, image, amenities, available } = req.body;
  db.prepare(
    'UPDATE rooms SET name=?, type=?, price=?, capacity=?, description=?, image=?, amenities=?, available=? WHERE id=?'
  ).run(
    name ?? room.name, type ?? room.type, price ?? room.price, capacity ?? room.capacity,
    description ?? room.description, image ?? room.image, amenities ?? room.amenities,
    available ?? room.available, req.params.id
  );
  res.json({ message: '房间更新成功' });
});

router.delete('/:id', auth, adminOnly, (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) return res.status(404).json({ error: '房间不存在' });
  db.prepare('DELETE FROM reviews WHERE room_id = ?').run(req.params.id);
  db.prepare('DELETE FROM bookings WHERE room_id = ?').run(req.params.id);
  db.prepare('DELETE FROM rooms WHERE id = ?').run(req.params.id);
  res.json({ message: '房间删除成功' });
});

module.exports = router;
