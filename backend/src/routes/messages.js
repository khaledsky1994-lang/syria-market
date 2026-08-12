const express = require('express');
const prisma = require('../prismaClient');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/conversations - list my conversations
router.get('/', requireAuth, async (req, res) => {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }] },
    include: {
      listing: { include: { images: true } },
      buyer: { select: { id: true, name: true, avatarUrl: true } },
      seller: { select: { id: true, name: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ conversations });
});

// POST /api/conversations - start (or get) a conversation about a listing
router.post('/', requireAuth, async (req, res) => {
  const { listingId, message } = req.body;
  const listing = await prisma.listing.findUnique({ where: { id: Number(listingId) } });
  if (!listing) return res.status(404).json({ error: 'الإعلان غير موجود / Listing not found' });
  if (listing.sellerId === req.user.id) {
    return res.status(400).json({ error: 'لا يمكنك مراسلة نفسك / Cannot message yourself' });
  }

  let conversation = await prisma.conversation.findUnique({
    where: { listingId_buyerId: { listingId: listing.id, buyerId: req.user.id } },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { listingId: listing.id, buyerId: req.user.id, sellerId: listing.sellerId },
    });
  }

  if (message) {
    await prisma.message.create({
      data: { conversationId: conversation.id, senderId: req.user.id, body: message },
    });
  }

  res.status(201).json({ conversation });
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) return res.status(404).json({ error: 'المحادثة غير موجودة / Conversation not found' });
  if (conversation.buyerId !== req.user.id && conversation.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'غير مصرح / Not authorized' });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
  });

  // Mark messages from the other user as read
  await prisma.message.updateMany({
    where: { conversationId: id, senderId: { not: req.user.id }, isRead: false },
    data: { isRead: true },
  });

  res.json({ messages });
});

// POST /api/conversations/:id/messages - send a message
router.post('/:id/messages', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { body } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ error: 'الرسالة فارغة / Empty message' });

  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) return res.status(404).json({ error: 'المحادثة غير موجودة / Conversation not found' });
  if (conversation.buyerId !== req.user.id && conversation.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'غير مصرح / Not authorized' });
  }

  const message = await prisma.message.create({
    data: { conversationId: id, senderId: req.user.id, body: body.trim() },
  });

  // emit via socket.io if available
  const io = req.app.get('io');
  if (io) io.to(`conversation_${id}`).emit('new_message', message);

  res.status(201).json({ message });
});

module.exports = router;
