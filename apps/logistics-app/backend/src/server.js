/**
 * MandiKart Delivery Partner API Server
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes');
const { errorHandler } = require('./middlewares/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files for uploaded photos/documents
app.use('/uploads', express.static('uploads'));

// API Routing
app.use('/api', apiRoutes);

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    name: 'MandiKart Logistics Backend API',
    version: '1.0.0',
    status: 'ACTIVE',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      driver: '/api/driver/*',
      deliveries: '/api/deliveries/*',
    },
  });
});

const http = require('http');
const socketService = require('./services/socketService');

// Centralized Error Handler
app.use(errorHandler);

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
socketService.init(server);

// Start Server on all interfaces (0.0.0.0) so Android Emulator (10.0.2.2), physical phones, and localhost connect seamlessly
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 MandiKart Logistics Backend Server running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Base API URL: http://localhost:${PORT}/api`);
  console.log(`📱 Android Emulator URL: http://10.0.2.2:${PORT}/api`);
  console.log(`⚡ WebSocket Server: Ready for live GPS driver telemetry`);
  console.log(`======================================================\n`);
});

module.exports = { app, server };

