const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware');

const router = express.Router();

router.get('/', (req, res) => {
  const { type, minPrice, maxPrice, capacity, available, search, page = 1, limit = 50 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
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
  sql += ' ORDER BY price ASC LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  // Add average rating to each room
  const rooms = db.prepare(sql).all(...params);
  const roomsWithRating = rooms.map(room => {
    const avg = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE room_id = ?').get(room.id);
    return { ...room, avgRating: avg.avg ? Number(avg.avg).toFixed(1) : null, reviewCount: avg.count };
  });

  res.json({ data: roomsWithRating, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) });
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
  db.prepare('DELETE FROM rooms WHERE id = ?').run(req.params.id);
  res.json({ message: '房间删除成功' });
});

module.exports = router;
