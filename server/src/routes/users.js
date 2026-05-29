const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware');

const router = express.Router();

router.get('/', auth, adminOnly, (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  let sql = 'SELECT id, username, email, role, created_at FROM users WHERE 1=1';
  let countSql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
  const params = [];
  const countParams = [];

  if (search) {
    sql += ' AND (username LIKE ? OR email LIKE ?)';
    countSql += ' AND (username LIKE ? OR email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
    countParams.push(`%${search}%`, `%${search}%`);
  }

  const total = db.prepare(countSql).get(...countParams).total;
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), offset);

  res.json({ data: db.prepare(sql).all(...params), total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) });
});

router.put('/me', auth, async (req, res) => {
  const { username, email } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: '用户不存在' });

  if (username && username !== user.username) {
    const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, user.id);
    if (existing) return res.status(409).json({ error: '用户名已存在' });
  }
  if (email && email !== user.email) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, user.id);
    if (existing) return res.status(409).json({ error: '邮箱已存在' });
  }

  db.prepare('UPDATE users SET username=?, email=? WHERE id=?').run(
    username ?? user.username, email ?? user.email, req.user.id
  );

  const updated = db.prepare('SELECT id, username, email, role FROM users WHERE id = ?').get(req.user.id);
  res.json({ message: '信息更新成功', user: updated });
});

router.put('/me/password', auth, async (req, res) => {
  const { old_password, new_password } = req.body;
  if (!old_password || !new_password) return res.status(400).json({ error: '请填写旧密码和新密码' });
  if (new_password.length < 6) return res.status(400).json({ error: '新密码至少6位' });

  const bcrypt = require('bcryptjs');
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  const match = await bcrypt.compare(old_password, user.password);
  if (!match) return res.status(401).json({ error: '旧密码不正确' });

  const hash = await bcrypt.hash(new_password, 10);
  db.prepare('UPDATE users SET password=? WHERE id=?').run(hash, req.user.id);
  res.json({ message: '密码修改成功' });
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
