const express = require('express');
const prisma = require('../prismaClient');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/:id/reviews
router.get('/users/:id/reviews', async (req, res) => {
  const targetId = Number(req.params.id);
  const reviews = await prisma.review.findMany({
    where: { targetId },
    include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null;
  res.json({ reviews, average: avg, count: reviews.length });
});

// POST /api/users/:id/reviews - leave a review for a seller
router.post('/users/:id/reviews', requireAuth, async (req, res) => {
  const targetId = Number(req.params.id);
  const { rating, comment } = req.body;

  if (targetId === req.user.id) {
    return res.status(400).json({ error: 'لا يمكنك تقييم نفسك / Cannot review yourself' });
  }
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'تقييم غير صالح (1-5) / Invalid rating (1-5)' });
  }

  const review = await prisma.review.upsert({
    where: { authorId_targetId: { authorId: req.user.id, targetId } },
    update: { rating: Number(rating), comment },
    create: { authorId: req.user.id, targetId, rating: Number(rating), comment },
  });

  res.status(201).json({ review });
});

module.exports = router;
