const express = require('express');
const prisma = require('../prismaClient');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/categories - list all categories (with subcategories)
router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: true },
  });
  res.json({ categories });
});

// POST /api/categories - admin only
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { nameAr, nameEn, slug, icon, parentId } = req.body;
  const category = await prisma.category.create({
    data: { nameAr, nameEn, slug, icon, parentId: parentId || null },
  });
  res.status(201).json({ category });
});

// DELETE /api/categories/:id - admin only
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ success: true });
});

module.exports = router;
