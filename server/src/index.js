const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const bookingRoutes = require('./routes/bookings');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器内部错误' });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
    app.listen(PORT + 1, () => {
      console.log(`Server running on http://localhost:${PORT + 1}`);
    });
  } else {
    throw err;
  }
});
