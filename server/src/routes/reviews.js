const express = require('express');
const db = require('../db');
const { auth } = require('../middleware');

const router = express.Router();

router.get('/room/:roomId', (req, res) => {
  const reviews = db.prepare(
    `SELECT r.*, u.username FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.room_id = ? ORDER BY r.created_at DESC`
  ).all(req.params.roomId);
  const avg = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE room_id = ?').get(req.params.roomId);
  res.json({ reviews, average: avg.avg ? Number(avg.avg).toFixed(1) : null, count: avg.count });
});

router.post('/', auth, (req, res) => {
  const { room_id, rating, comment } = req.body;
  if (!room_id || !rating) return res.status(400).json({ error: '请填写房间ID和评分' });
  if (rating < 1 || rating > 5) return res.status(400).json({ error: '评分范围1-5' });

  const hasBooking = db.prepare(
    `SELECT id FROM bookings WHERE room_id = ? AND user_id = ? AND status != 'cancelled'`
  ).get(room_id, req.user.id);
  if (!hasBooking) return res.status(403).json({ error: '只有预订过此房间的用户才能评价' });

  const existing = db.prepare('SELECT id FROM reviews WHERE room_id = ? AND user_id = ?').get(room_id, req.user.id);
  if (existing) return res.status(409).json({ error: '您已评价过此房间' });

  db.prepare('INSERT INTO reviews (room_id, user_id, rating, comment) VALUES (?, ?, ?, ?)')
    .run(room_id, req.user.id, rating, comment || '');
  res.status(201).json({ message: '评价成功' });
});

module.exports = router;
