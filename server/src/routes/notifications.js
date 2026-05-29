const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware');

const router = express.Router();

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
