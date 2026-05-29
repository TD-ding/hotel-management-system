const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware');

const router = express.Router();

router.get('/bookings', auth, adminOnly, (req, res) => {
  const { status, search } = req.query;
  let sql = `SELECT b.*, u.username, r.name as room_name
    FROM bookings b JOIN users u ON b.user_id = u.id JOIN rooms r ON b.room_id = r.id WHERE 1=1`;
  const params = [];
  if (status) { sql += ' AND b.status = ?'; params.push(status); }
  if (search) { sql += ' AND (u.username LIKE ? OR r.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  sql += ' ORDER BY b.created_at DESC';
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
  const rows = db.prepare(sql).all(...params);
  res.write('﻿ID,用户,房间,入住,退房,人数,总价,状态,创建时间\n');
  rows.forEach(r => {
    res.write(`${r.id},${r.username},${r.room_name},${r.check_in},${r.check_out},${r.guests},${r.total_price},${r.status},${r.created_at}\n`);
  });
  res.end();
});

router.get('/users', auth, adminOnly, (req, res) => {
  const rows = db.prepare('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC').all();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
  res.write('﻿ID,用户名,邮箱,角色,注册时间\n');
  rows.forEach(r => { res.write(`${r.id},${r.username},${r.email},${r.role},${r.created_at}\n`); });
  res.end();
});

router.get('/rooms', auth, adminOnly, (req, res) => {
  const rows = db.prepare('SELECT * FROM rooms ORDER BY id').all();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=rooms.csv');
  res.write('﻿ID,名称,类型,价格,容量,可用,创建时间\n');
  rows.forEach(r => { res.write(`${r.id},${r.name},${r.type},${r.price},${r.capacity},${r.available},${r.created_at}\n`); });
  res.end();
});

module.exports = router;
