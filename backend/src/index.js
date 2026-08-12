require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const listingRoutes = require('./routes/listings');
const conversationRoutes = require('./routes/messages');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');
const reportRoutes = require('./routes/reports');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Syria Market API' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api', reviewRoutes); // /api/users/:id/reviews
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// Real-time chat via socket.io
io.on('connection', (socket) => {
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'خطأ في الخادم / Server error' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Syria Market API running on http://localhost:${PORT}`);
});
