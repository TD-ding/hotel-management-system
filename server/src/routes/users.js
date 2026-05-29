const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware');

const router = express.Router();

router.get('/', auth, adminOnly, (req, res) => {
  const users = db.prepare('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

router.put('/:id', auth, adminOnly, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });

  const { username, email, role } = req.body;
  db.prepare('UPDATE users SET username=?, email=?, role=? WHERE id=?').run(
    username ?? user.username, email ?? user.email, role ?? user.role, req.params.id
  );
  res.json({ message: '用户更新成功' });
});

router.delete('/:id', auth, adminOnly, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  if (user.role === 'admin') return res.status(403).json({ error: '无法删除管理员账户' });
  db.prepare('DELETE FROM bookings WHERE user_id = ?').run(req.params.id);
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: '用户删除成功' });
});

module.exports = router;
