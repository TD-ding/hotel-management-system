const express = require('express');
const db = require('../db');
const { auth, adminOnly } = require('../middleware');

const router = express.Router();

router.get('/', auth, adminOnly, (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('user').count;
  const totalRooms = db.prepare('SELECT COUNT(*) as count FROM rooms').get().count;
  const availableRooms = db.prepare('SELECT COUNT(*) as count FROM rooms WHERE available = 1').get().count;
  const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
  const pendingBookings = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = ?').get('pending').count;
  const confirmedBookings = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = ?').get('confirmed').count;
  const checkedInBookings = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = ?').get('checked_in').count;
  const checkedOutBookings = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = ?').get('checked_out').count;
  const cancelledBookings = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = ?').get('cancelled').count;
  const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_price), 0) as sum FROM bookings WHERE status != 'cancelled'").get().sum;

  const revenueByType = db.prepare(
    `SELECT r.type, COALESCE(SUM(b.total_price), 0) as revenue, COUNT(b.id) as count
     FROM rooms r LEFT JOIN bookings b ON r.id = b.room_id AND b.status != 'cancelled'
     GROUP BY r.type`
  ).all();

  const recentBookings = db.prepare(
    `SELECT b.id, u.username, r.name as room_name, b.check_in, b.check_out, b.total_price, b.status
     FROM bookings b JOIN users u ON b.user_id = u.id JOIN rooms r ON b.room_id = r.id
     ORDER BY b.created_at DESC LIMIT 5`
  ).all();

  res.json({
    totalUsers, totalRooms, availableRooms,
    totalBookings, pendingBookings, confirmedBookings, checkedInBookings, checkedOutBookings, cancelledBookings,
    totalRevenue, revenueByType, recentBookings
  });
});

module.exports = router;
