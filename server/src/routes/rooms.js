const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware');

const router = express.Router();

router.get('/', (req, res) => {
  const { type, minPrice, maxPrice, capacity, available } = req.query;
  let sql = 'SELECT * FROM rooms WHERE 1=1';
  const params = [];

  if (type) { sql += ' AND type = ?'; params.push(type); }
  if (minPrice) { sql += ' AND price >= ?'; params.push(Number(minPrice)); }
  if (maxPrice) { sql += ' AND price <= ?'; params.push(Number(maxPrice)); }
  if (capacity) { sql += ' AND capacity >= ?'; params.push(Number(capacity)); }
  if (available !== undefined) { sql += ' AND available = ?'; params.push(Number(available)); }

  sql += ' ORDER BY price ASC';
  const rooms = db.prepare(sql).all(...params);
  res.json(rooms);
});

router.get('/:id', (req, res) => {
  const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(req.params.id);
  if (!room) return res.status(404).json({ error: '房间不存在' });
  res.json(room);
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
