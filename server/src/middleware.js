const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'hotel-management-secret-key-2025';

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: '未提供认证令牌' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: '令牌无效或已过期' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '需要管理员权限' });
  }
  next();
}

module.exports = { auth, adminOnly, JWT_SECRET };
