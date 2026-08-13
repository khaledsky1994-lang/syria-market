const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { body, validationResult } = require('express-validator');
const prisma = require('../prismaClient');
const { requireAuth } = require('../middleware/auth');
const { sendVerificationEmail } = require('../utils/mailer');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function publicUser(user) {
  const { passwordHash, verificationToken, verificationTokenExpiresAt, ...rest } = user;
  return rest;
}

async function issueVerificationEmail(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken: token, verificationTokenExpiresAt: expiresAt },
  });
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  await sendVerificationEmail(user.email, user.name, verifyUrl);
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

    await issueVerificationEmail(user);

    const token = signToken(user.id);
    res.status(201).json({ token, user: publicUser(user), verificationSent: true });
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
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'بيانات الدخول غير صحيحة / Invalid credentials' });
    }
    if (user.isBanned) return res.status(403).json({ error: 'تم حظر هذا الحساب / Account banned' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة / Invalid credentials' });

    const token = signToken(user.id);
    res.json({ token, user: publicUser(user) });
  }
);

// POST /api/auth/google — sign in / sign up with a Google ID token
router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing Google credential' });
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(501).json({ error: 'تسجيل الدخول بجوجل غير مُفعّل على الخادم / Google sign-in is not configured on the server yet' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await prisma.user.findFirst({ where: { OR: [{ googleId }, { email }] } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId,
          email,
          name: name || email.split('@')[0],
          phone: `google_${googleId}`.slice(0, 20), // placeholder, user can update later
          avatarUrl: picture,
          emailVerified: true, // Google already verified this email
        },
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({ where: { id: user.id }, data: { googleId, emailVerified: true } });
    }

    if (user.isBanned) return res.status(403).json({ error: 'تم حظر هذا الحساب / Account banned' });

    const token = signToken(user.id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'فشل التحقق من حساب جوجل / Google verification failed' });
  }
});

// POST /api/auth/apple — stub, ready to wire up once you have Apple Developer credentials
router.post('/apple', async (req, res) => {
  if (!process.env.APPLE_CLIENT_ID) {
    return res.status(501).json({
      error: 'تسجيل الدخول بآبل غير مُفعّل بعد — يحتاج حساب Apple Developer / Apple sign-in requires an Apple Developer account to be configured',
    });
  }
  // Once APPLE_CLIENT_ID etc. are set, verify the identityToken the same way
  // Google is verified above (Apple publishes JWKS for this), then create/find the user.
  res.status(501).json({ error: 'Not implemented yet' });
});

// GET /api/auth/verify-email?token=...
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'رمز التأكيد مفقود / Missing token' });

  const user = await prisma.user.findFirst({ where: { verificationToken: token } });
  if (!user || !user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < new Date()) {
    return res.status(400).json({ error: 'رابط التأكيد غير صالح أو منتهي / Invalid or expired verification link' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null, verificationTokenExpiresAt: null },
  });

  res.json({ success: true });
});

// POST /api/auth/resend-verification
router.post('/resend-verification', requireAuth, async (req, res) => {
  if (req.user.emailVerified) return res.status(400).json({ error: 'البريد مؤكد بالفعل / Email already verified' });
  await issueVerificationEmail(req.user);
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
