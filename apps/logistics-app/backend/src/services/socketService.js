/**
 * Real-Time WebSockets Engine (Socket.io)
 * Powers live GPS driver telemetry, order tracking streams, and dispatcher control room.
 */
const { Server } = require('socket.io');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedDrivers = new Map(); // socketId -> { driverId, hubId, lastLocation, status }
  }

  /**
   * Initialize Socket.io with existing HTTP server
   */
  init(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
      },
      pingTimeout: 10000,
      pingInterval: 5000,
    });

    this.io.on('connection', (socket) => {
      console.log(`📡 [WebSocket] Client connected: ${socket.id}`);

      // 1. Driver Joins Room
      socket.on('driver:join', (payload = {}) => {
        const { driverId, hubId = 'MANDI-AZADPUR' } = payload;
        if (!driverId) return;

        socket.join(`driver:${driverId}`);
        socket.join(`hub:${hubId}`);

        this.connectedDrivers.set(socket.id, {
          driverId,
          hubId,
          status: 'ONLINE',
          lastLocation: null,
          joinedAt: new Date().toISOString(),
        });

        console.log(`🚗 [WebSocket] Driver joined: ${driverId} in Hub: ${hubId}`);
        socket.emit('driver:joined', {
          success: true,
          driverId,
          hubId,
          timestamp: new Date().toISOString(),
        });
      });

      // 2. Real-Time GPS Telemetry Streaming
      socket.on('driver:location:update', (locationData = {}) => {
        const { driverId, lat, lng, speed, heading, activeOrderId, hubId } = locationData;
        if (!lat || !lng) return;

        const driverInfo = this.connectedDrivers.get(socket.id) || {};
        driverInfo.lastLocation = {
          lat,
          lng,
          speed: speed || 0,
          heading: heading || 0,
          timestamp: new Date().toISOString(),
        };
        this.connectedDrivers.set(socket.id, driverInfo);

        // Stream to order room so buyer & dispatch see live movement
        if (activeOrderId) {
          this.io.to(`order:${activeOrderId}`).emit('order:location:live', {
            orderId: activeOrderId,
            driverId,
            location: driverInfo.lastLocation,
          });
        }

        // Stream to Mandi Hub dispatcher room
        const targetHub = hubId || driverInfo.hubId || 'MANDI-AZADPUR';
        this.io.to(`hub:${targetHub}`).emit('hub:telemetry:live', {
          driverId,
          activeOrderId,
          location: driverInfo.lastLocation,
        });
      });

      // 3. Driver Duty Status Change (ONLINE / OFFLINE / IN_TRANSIT)
      socket.on('driver:status:update', (statusData = {}) => {
        const { driverId, status } = statusData;
        const driverInfo = this.connectedDrivers.get(socket.id);
        if (driverInfo) {
          driverInfo.status = status;
          this.connectedDrivers.set(socket.id, driverInfo);
        }

        this.io.emit('fleet:driver:status', {
          driverId,
          status,
          timestamp: new Date().toISOString(),
        });
      });

      // 4. Buyer or Dispatcher Subscribes to an Order
      socket.on('order:subscribe', (payload = {}) => {
        const { orderId } = payload;
        if (orderId) {
          socket.join(`order:${orderId}`);
          console.log(`📦 [WebSocket] Subscribed to order stream: ${orderId}`);
          socket.emit('order:subscribed', { orderId, success: true });
        }
      });

      // 5. Unsubscribe from Order
      socket.on('order:unsubscribe', (payload = {}) => {
        const { orderId } = payload;
        if (orderId) {
          socket.leave(`order:${orderId}`);
        }
      });

      // 6. Handle Disconnection
      socket.on('disconnect', () => {
        const driverInfo = this.connectedDrivers.get(socket.id);
        if (driverInfo) {
          console.log(`❌ [WebSocket] Driver disconnected: ${driverInfo.driverId}`);
          this.io.emit('fleet:driver:status', {
            driverId: driverInfo.driverId,
            status: 'OFFLINE',
            timestamp: new Date().toISOString(),
          });
          this.connectedDrivers.delete(socket.id);
        } else {
          console.log(`❌ [WebSocket] Client disconnected: ${socket.id}`);
        }
      });
    });

    console.log('⚡ Socket.io WebSocket Engine successfully initialized');
    return this.io;
  }

  /**
   * Broadcast message to a specific driver
   */
  notifyDriver(driverId, event, data) {
    if (this.io) {
      this.io.to(`driver:${driverId}`).emit(event, data);
    }
  }

  /**
   * Broadcast update to an order's tracking room
   */
  notifyOrder(orderId, event, data) {
    if (this.io) {
      this.io.to(`order:${orderId}`).emit(event, data);
    }
  }

  /**
   * Broadcast update to a Mandi Hub room
   */
  notifyHub(hubId, event, data) {
    if (this.io) {
      this.io.to(`hub:${hubId}`).emit(event, data);
    }
  }

  /**
   * Get active online drivers count
   */
  getConnectedStats() {
    return {
      totalConnections: this.io ? this.io.engine.clientsCount : 0,
      activeDrivers: this.connectedDrivers.size,
    };
  }
}

module.exports = new SocketService();
