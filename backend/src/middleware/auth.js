const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

// Verifies JWT and attaches the user to req.user
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'يجب تسجيل الدخول / Login required' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ error: 'مستخدم غير موجود / User not found' });
    if (user.isBanned) return res.status(403).json({ error: 'تم حظر هذا الحساب / Account banned' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة غير صالحة / Invalid session' });
  }
}

// Optional auth: attaches user if token present, but doesn't block the request
async function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next();
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (user) req.user = user;
    next();
  } catch (err) {
    next();
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'صلاحيات المشرف مطلوبة / Admin access required' });
  }
  next();
}

module.exports = { requireAuth, optionalAuth, requireAdmin };
