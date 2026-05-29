const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware');

const router = express.Router();

router.get('/', auth, adminOnly, (req, res) => {
  const { status, user_id } = req.query;
  let sql = `SELECT b.*, u.username, r.name as room_name, r.type as room_type
    FROM bookings b JOIN users u ON b.user_id = u.id JOIN rooms r ON b.room_id = r.id WHERE 1=1`;
  const params = [];
  if (status) { sql += ' AND b.status = ?'; params.push(status); }
  if (user_id) { sql += ' AND b.user_id = ?'; params.push(Number(user_id)); }
  sql += ' ORDER BY b.created_at DESC';
  res.json(db.prepare(sql).all(...params));
});

router.get('/my', auth, (req, res) => {
  const bookings = db.prepare(
    `SELECT b.*, r.name as room_name, r.type as room_type, r.image as room_image
     FROM bookings b JOIN rooms r ON b.room_id = r.id
     WHERE b.user_id = ? ORDER BY b.created_at DESC`
  ).all(req.user.id);
  res.json(bookings);
});

function validateDates(check_in, check_out) {
  if (new Date(check_out) <= new Date(check_in)) {
    return '退房日期必须晚于入住日期';
  }
  return null;
}

router.post('/', auth, (req, res) => {
  const { room_id, check_in, check_out, guests } = req.body;
  if (!room_id || !check_in || !check_out) {
    return res.status(400).json({ error: '请填写所有必填字段' });
  }

  const dateErr = validateDates(check_in, check_out);
  if (dateErr) return res.status(400).json({ error: dateErr });

  const room = db.prepare('SELECT * FROM rooms WHERE id = ? AND available = 1').get(room_id);
  if (!room) return res.status(404).json({ error: '房间不存在或不可用' });

  const nights = Math.max(1, Math.ceil((new Date(check_out) - new Date(check_in)) / 86400000));
  const total_price = room.price * nights;

  const conflict = db.prepare(
    `SELECT id FROM bookings WHERE room_id = ? AND status != 'cancelled'
     AND check_in < ? AND check_out > ?`
  ).get(room_id, check_out, check_in);
  if (conflict) return res.status(409).json({ error: '该日期房间已被预订' });

  const result = db.prepare(
    'INSERT INTO bookings (user_id, room_id, check_in, check_out, guests, total_price) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, room_id, check_in, check_out, guests || 1, total_price);

  res.status(201).json({ id: result.lastInsertRowid, total_price, nights, message: '预订成功' });
});

router.put('/:id', auth, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: '预订不存在' });

  const { status, check_in, check_out, guests } = req.body;

  // Only admin can change status to confirmed
  if (status === 'confirmed' && req.user.role !== 'admin') {
    return res.status(403).json({ error: '只有管理员才能确认预订' });
  }

  if (status && !['pending', 'confirmed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: '无效的状态' });
  }

  // Non-admin users can only cancel their own bookings
  if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
    return res.status(403).json({ error: '无权操作此预订' });
  }

  // Non-admin can only cancel, not change other fields
  if (req.user.role !== 'admin' && status !== 'cancelled') {
    return res.status(403).json({ error: '用户只能取消预订，如需修改请联系管理员' });
  }

  const newCheckIn = check_in ?? booking.check_in;
  const newCheckOut = check_out ?? booking.check_out;

  const dateErr = validateDates(newCheckIn, newCheckOut);
  if (dateErr) return res.status(400).json({ error: dateErr });

  // Check date conflict if dates changed
  if ((check_in && check_in !== booking.check_in) || (check_out && check_out !== booking.check_out)) {
    const conflict = db.prepare(
      `SELECT id FROM bookings WHERE room_id = ? AND status != 'cancelled'
       AND id != ? AND check_in < ? AND check_out > ?`
    ).get(booking.room_id, booking.id, newCheckOut, newCheckIn);
    if (conflict) return res.status(409).json({ error: '修改后的日期与已有预订冲突' });
  }

  db.prepare('UPDATE bookings SET status=?, check_in=?, check_out=?, guests=? WHERE id=?').run(
    status ?? booking.status,
    newCheckIn,
    newCheckOut,
    guests ?? booking.guests,
    req.params.id
  );
  res.json({ message: '预订更新成功' });
});

router.delete('/:id', auth, adminOnly, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: '预订不存在' });
  db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
  res.json({ message: '预订删除成功' });
});

module.exports = router;
