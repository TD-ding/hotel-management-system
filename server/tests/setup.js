const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

let mockDb;

function createTestDb() {
  const dbPath = path.join(__dirname, `test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      price REAL NOT NULL,
      capacity INTEGER NOT NULL,
      description TEXT,
      image TEXT,
      amenities TEXT,
      available INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      guests INTEGER NOT NULL DEFAULT 1,
      total_price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    );
    CREATE TABLE reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (room_id) REFERENCES rooms(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  db._testPath = dbPath;
  mockDb = db;
  return db;
}

async function seedTestDb(db) {
  const hash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);
  db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('admin', 'admin@test.com', hash, 'admin');
  db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run('demo', 'demo@test.com', userHash, 'user');
  db.prepare('INSERT INTO rooms (name, type, price, capacity, description, amenities, available) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('豪华大床房', 'deluxe', 599, 2, '豪华大床房描述', 'WiFi,空调', 1);
  db.prepare('INSERT INTO rooms (name, type, price, capacity, description, amenities, available) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run('标准双床房', 'standard', 399, 2, '标准双床房描述', 'WiFi', 1);
  db.prepare('INSERT INTO bookings (user_id, room_id, check_in, check_out, guests, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(2, 1, '2025-01-01', '2025-01-03', 2, 1198, 'pending');
}

function cleanupDb(db) {
  const p = db._testPath;
  db.close();
  if (p) {
    try { fs.unlinkSync(p); } catch {}
    try { fs.unlinkSync(p + '-shm'); } catch {}
    try { fs.unlinkSync(p + '-wal'); } catch {}
  }
}

function getAdminToken() {
  return jwt.sign({ id: 1, username: 'admin', role: 'admin' }, process.env.JWT_SECRET);
}

function getUserToken() {
  return jwt.sign({ id: 2, username: 'demo', role: 'user' }, process.env.JWT_SECRET);
}

function adminAuth() {
  return { Authorization: `Bearer ${getAdminToken()}` };
}

function userAuth() {
  return { Authorization: `Bearer ${getUserToken()}` };
}

// This is called by the db mock — must return the current mockDb
function mockGetDb() {
  return mockDb;
}

module.exports = { createTestDb, seedTestDb, cleanupDb, getAdminToken, getUserToken, adminAuth, userAuth, mockGetDb };
