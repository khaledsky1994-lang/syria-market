const express = require('express');
const multer = require('multer');
const path = require('path');
const prisma = require('../prismaClient');
const { requireAuth, optionalAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/listings - search & filter
// query params: q, categoryId, city, minPrice, maxPrice, condition, sort, page, pageSize
router.get('/', optionalAuth, async (req, res) => {
  const {
    q, categoryId, city, minPrice, maxPrice, condition,
    sort = 'newest', page = 1, pageSize = 20,
  } = req.query;

  let categoryFilter;
  if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
      include: { children: true },
    });
    const ids = category ? [category.id, ...category.children.map((c) => c.id)] : [Number(categoryId)];
    categoryFilter = { categoryId: { in: ids } };
  }

  const where = {
    status: 'ACTIVE',
    ...(q && {
      OR: [
        { title: { contains: q } },
        { description: { contains: q } },
      ],
    }),
    ...(categoryFilter || {}),
    ...(city && { city }),
    ...(condition && { condition }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: Number(minPrice) }),
        ...(maxPrice && { lte: Number(maxPrice) }),
      },
    }),
  };

  const orderBy =
    sort === 'price_asc' ? { price: 'asc' } :
    sort === 'price_desc' ? { price: 'desc' } :
    { createdAt: 'desc' };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      include: { images: true, category: true, seller: { select: { id: true, name: true, city: true, avatarUrl: true } } },
    }),
    prisma.listing.count({ where }),
  ]);

  res.json({ listings, total, page: Number(page), pageSize: Number(pageSize) });
});

// GET /api/listings/:id
router.get('/:id', optionalAuth, async (req, res) => {
  const id = Number(req.params.id);
  const listing = await prisma.listing.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    include: {
      images: true,
      category: true,
      seller: { select: { id: true, name: true, city: true, avatarUrl: true, createdAt: true, emailVerified: true } },
    },
  }).catch(() => null);

  if (!listing) return res.status(404).json({ error: 'الإعلان غير موجود / Listing not found' });
  res.json({ listing });
});

// POST /api/listings - create (with image upload)
router.post('/', requireAuth, upload.array('images', 8), async (req, res) => {
  const { title, description, price, currency, condition, city, negotiable, categoryId } = req.body;

  if (!title || !description || !price || !categoryId || !city) {
    return res.status(400).json({ error: 'حقول مطلوبة ناقصة / Missing required fields' });
  }

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      price: Number(price),
      currency: currency || 'SYP',
      condition: condition || 'GOOD',
      city,
      negotiable: negotiable === 'false' ? false : true,
      sellerId: req.user.id,
      categoryId: Number(categoryId),
      images: {
        create: (req.files || []).map(f => ({ url: `/uploads/${f.filename}` })),
      },
    },
    include: { images: true },
  });

  res.status(201).json({ listing });
});

// PUT /api/listings/:id - update own listing
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return res.status(404).json({ error: 'الإعلان غير موجود / Listing not found' });
  if (listing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'غير مصرح / Not authorized' });
  }

  const { title, description, price, condition, city, negotiable, status, categoryId } = req.body;
  const updated = await prisma.listing.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(price && { price: Number(price) }),
      ...(condition && { condition }),
      ...(city && { city }),
      ...(negotiable !== undefined && { negotiable: Boolean(negotiable) }),
      ...(status && { status }),
      ...(categoryId && { categoryId: Number(categoryId) }),
    },
    include: { images: true, category: true },
  });
  res.json({ listing: updated });
});

// DELETE /api/listings/:id - delete own listing (or admin)
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return res.status(404).json({ error: 'الإعلان غير موجود / Listing not found' });
  if (listing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'غير مصرح / Not authorized' });
  }
  await prisma.listing.delete({ where: { id } });
  res.json({ success: true });
});

// POST /api/listings/:id/favorite - toggle favorite
router.post('/:id/favorite', requireAuth, async (req, res) => {
  const listingId = Number(req.params.id);
  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: req.user.id, listingId } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return res.json({ favorited: false });
  }
  await prisma.favorite.create({ data: { userId: req.user.id, listingId } });
  res.json({ favorited: true });
});

// GET /api/listings/user/me - my listings
router.get('/user/me', requireAuth, async (req, res) => {
  const listings = await prisma.listing.findMany({
    where: { sellerId: req.user.id },
    include: { images: true, category: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ listings });
});

module.exports = router;
