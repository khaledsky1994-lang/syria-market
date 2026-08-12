const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../prismaClient');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('الاسم مطلوب / Name is required'),
    body('email').isEmail().withMessage('بريد إلكتروني غير صالح / Invalid email'),
    body('phone').trim().isLength({ min: 8 }).withMessage('رقم هاتف غير صالح / Invalid phone'),
    body('password').isLength({ min: 6 }).withMessage('كلمة المرور 6 أحرف على الأقل / Password min 6 chars'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, phone, password, city } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) {
      return res.status(409).json({ error: 'البريد أو الهاتف مستخدم مسبقاً / Email or phone already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, city },
    });

    const token = signToken(user.id);
    res.status(201).json({ token, user: publicUser(user) });
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('identifier').notEmpty().withMessage('البريد أو الهاتف مطلوب / Email or phone required'),
    body('password').notEmpty().withMessage('كلمة المرور مطلوبة / Password required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { identifier, password } = req.body;
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
    });
    if (!user) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة / Invalid credentials' });
    if (user.isBanned) return res.status(403).json({ error: 'تم حظر هذا الحساب / Account banned' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة / Invalid credentials' });

    const token = signToken(user.id);
    res.json({ token, user: publicUser(user) });
  }
);

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
