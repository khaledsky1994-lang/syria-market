const express = require('express');
const prisma = require('../prismaClient');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

// GET /api/admin/stats - dashboard overview
router.get('/stats', async (req, res) => {
  const [userCount, listingCount, activeListings, reportCount] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.listing.count({ where: { status: 'ACTIVE' } }),
    prisma.report.count(),
  ]);
  res.json({ userCount, listingCount, activeListings, reportCount });
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true, isBanned: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ users });
});

// PUT /api/admin/users/:id/ban - toggle ban
router.put('/users/:id/ban', async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'المستخدم غير موجود / User not found' });
  const updated = await prisma.user.update({ where: { id }, data: { isBanned: !user.isBanned } });
  res.json({ isBanned: updated.isBanned });
});

// GET /api/admin/listings/pending - listings needing review
router.get('/listings/pending', async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: { images: true, seller: { select: { id: true, name: true } } },
  });
  res.json({ listings });
});

// PUT /api/admin/listings/:id/status - approve / reject / hide a listing
router.put('/listings/:id/status', async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body; // ACTIVE, REJECTED, HIDDEN
  const listing = await prisma.listing.update({ where: { id }, data: { status } });
  res.json({ listing });
});

// GET /api/admin/reports
router.get('/reports', async (req, res) => {
  const reports = await prisma.report.findMany({
    include: {
      listing: { include: { images: true } },
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ reports });
});

module.exports = router;
