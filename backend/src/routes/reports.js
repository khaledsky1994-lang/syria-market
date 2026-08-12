const express = require('express');
const prisma = require('../prismaClient');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/reports - report a listing (spam, scam, prohibited item, etc.)
router.post('/', requireAuth, async (req, res) => {
  const { listingId, reason } = req.body;
  if (!listingId || !reason) {
    return res.status(400).json({ error: 'حقول مطلوبة ناقصة / Missing required fields' });
  }
  const report = await prisma.report.create({
    data: { listingId: Number(listingId), authorId: req.user.id, reason },
  });
  res.status(201).json({ report });
});

module.exports = router;
