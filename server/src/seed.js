const db = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  const clean = db.transaction(() => {
    db.prepare('DELETE FROM bookings').run();
    db.prepare('DELETE FROM rooms').run();
    db.prepare('DELETE FROM users').run();
  });

  clean();

  const adminHash = await bcrypt.hash('admin123', 10);
  db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('admin', 'admin@hotel.com', adminHash, 'admin');

  const userHash = await bcrypt.hash('user123', 10);
  db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('demo', 'demo@example.com', userHash, 'user');
  db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)')
    .run('john', 'john@example.com', userHash, 'user');

  const rooms = [
    { name: '豪华大床房', type: 'deluxe', price: 588, capacity: 2, description: '宽敞舒适的大床房，配备高品质床品和现代化浴室，城市景观尽收眼底。', image: '/images/deluxe.jpg', amenities: 'WiFi,空调,迷你吧,保险箱,浴袍' },
    { name: '标准双床房', type: 'standard', price: 388, capacity: 2, description: '温馨双床房，适合商务出行或朋友结伴，设施齐全。', image: '/images/standard.jpg', amenities: 'WiFi,空调,电视,淋浴' },
    { name: '行政套房', type: 'suite', price: 988, capacity: 3, description: '尊享行政楼层，独立客厅与卧室，行政酒廊免费使用权。', image: '/images/suite.jpg', amenities: 'WiFi,空调,迷你吧,保险箱,浴袍,行政酒廊,咖啡机' },
    { name: '总统套房', type: 'presidential', price: 2888, capacity: 4, description: '极致奢华的总统套房，270度全景落地窗，私人管家服务。', image: '/images/presidential.jpg', amenities: 'WiFi,空调,迷你吧,保险箱,浴袍,行政酒廊,咖啡机,私人管家,按摩浴缸' },
    { name: '家庭房', type: 'family', price: 688, capacity: 4, description: '专为家庭设计，儿童活动区，亲子友好设施。', image: '/images/family.jpg', amenities: 'WiFi,空调,电视,儿童区,冰箱' },
    { name: '商务房', type: 'business', price: 488, capacity: 2, description: '为商务人士打造，配备办公桌和快速网络，高效办公无忧。', image: '/images/business.jpg', amenities: 'WiFi,空调,办公桌,打印服务,迷你吧' },
  ];

  const insertRoom = db.prepare(
    'INSERT INTO rooms (name, type, price, capacity, description, image, amenities) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  rooms.forEach(r => insertRoom.run(r.name, r.type, r.price, r.capacity, r.description, r.image, r.amenities));

  const insertBooking = db.prepare(
    'INSERT INTO bookings (user_id, room_id, check_in, check_out, guests, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  insertBooking.run(2, 1, '2025-06-01', '2025-06-03', 2, 1176, 'confirmed');
  insertBooking.run(2, 3, '2025-06-10', '2025-06-12', 2, 1976, 'pending');
  insertBooking.run(3, 2, '2025-06-05', '2025-06-07', 2, 776, 'confirmed');
  insertBooking.run(3, 5, '2025-07-01', '2025-07-05', 4, 2752, 'cancelled');

  console.log('Seed data inserted successfully!');
}

seed().catch(err => { console.error(err); process.exit(1); });
