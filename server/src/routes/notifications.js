const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware');

const router = express.Router();

router.get('/room/:roomId', (req, res) => {
  const { month, year } = req.query;
  const roomId = req.params.roomId;

  let startDate, endDate;
  if (month && year) {
    startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = Number(month) === 12 ? 1 : Number(month) + 1;
    const nextYear = Number(month) === 12 ? Number(year) + 1 : Number(year);
    endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
  } else {
    const now = new Date();
    startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const nextMonth = now.getMonth() === 11 ? 0 : now.getMonth() + 1;
    const nextYear = now.getMonth() === 11 ? now.getFullYear() + 1 : now.getFullYear();
    endDate = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-01`;
  }

  const bookings = db.prepare(
    `SELECT check_in, check_out FROM bookings
     WHERE room_id = ? AND status != 'cancelled'
     AND check_out > ? AND check_in < ?
     ORDER BY check_in`
  ).all(roomId, startDate, endDate);

  const bookedDates = [];
  bookings.forEach(b => {
    const start = new Date(b.check_in);
    const end = new Date(b.check_out);
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      bookedDates.push(d.toISOString().split('T')[0]);
    }
  });

  res.json({ bookedDates, month: Number(month) || new Date().getMonth() + 1, year: Number(year) || new Date().getFullYear() });
});

router.get('/my', auth, (req, res) => {
  const notifications = db.prepare(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.user.id);
  res.json(notifications);
});

router.get('/my/unread', auth, (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0').get(req.user.id).count;
  res.json({ count });
});

router.put('/my/read', auth, (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0').run(req.user.id);
  res.json({ message: '已全部标记为已读' });
});

router.post('/', auth, adminOnly, (req, res) => {
  const { user_id, message } = req.body;
  if (!user_id || !message) return res.status(400).json({ error: '请填写用户ID和消息内容' });
  db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(user_id, message);
  res.status(201).json({ message: '通知发送成功' });
});

module.exports = router;
