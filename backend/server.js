require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Init WebSockets
const io = initSocket(server);
app.set('io', io);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  })
);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'Opay-Personal Backend Server',
    time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/super-admin', require('./routes/superAdmin'));
app.use('/api/company', require('./routes/company'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/external', require('./routes/external'));
app.use('/api/payment', require('./routes/payment'));

// 404 Route
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another process.`);
    console.error(`💡 Free port ${PORT} or change PORT in .env file.`);
  } else {
    console.error('Server Listen Error:', err);
  }
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Opay-Personal Server running on port ${PORT}`);
  console.log(`🌐 Base API URL: http://localhost:${PORT}/api`);
  console.log(`====================================================`);
});

