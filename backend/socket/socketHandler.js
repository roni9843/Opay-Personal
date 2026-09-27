const { Server } = require('socket.io');
const Device = require('../models/Device');

// In-memory online devices tracking
// deviceCode -> { deviceCode, socketId, active: true, lastSeen: ISO String, telemetry }
const onlineDevices = new Map();

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    let currentDeviceCode = null;

    // Device registers via Socket
    socket.on('device:register', async (payload = {}) => {
      const deviceCode = payload.deviceCode || payload.deviceId;
      if (!deviceCode) return;

      currentDeviceCode = String(deviceCode);
      console.log(`[Socket] Device registered: ${currentDeviceCode} (Socket ID: ${socket.id})`);

      const telemetry = {
        batteryLevel: payload.batteryLevel ?? 100,
        isCharging: payload.isCharging ?? false,
        networkType: payload.networkType || 'WiFi',
        networkName: payload.networkName || 'Connected',
        fcmToken: payload.fcmToken || null,
      };

      onlineDevices.set(currentDeviceCode, {
        deviceCode: currentDeviceCode,
        socketId: socket.id,
        active: true,
        lastSeen: new Date().toISOString(),
        ...telemetry,
      });

      // Update Device in Database
      try {
        await Device.findOneAndUpdate(
          { deviceCode: currentDeviceCode },
          {
            $set: {
              state: true,
              lastSeen: new Date(),
              batteryLevel: telemetry.batteryLevel,
              isCharging: telemetry.isCharging,
              networkType: telemetry.networkType,
              networkName: telemetry.networkName,
              ...(telemetry.fcmToken && { fcmToken: telemetry.fcmToken }),
            },
          }
        );
      } catch (err) {
        console.error('[Socket DB Update Error]:', err.message);
      }

      // Broadcast device status update to all connected dashboard clients
      io.emit('device:status_change', {
        deviceCode: currentDeviceCode,
        state: true,
        lastSeen: new Date().toISOString(),
        ...telemetry,
      });
    });

    // Device Heartbeat
    socket.on('device:heartbeat', async (payload = {}) => {
      if (!currentDeviceCode) return;

      const now = new Date().toISOString();
      const existing = onlineDevices.get(currentDeviceCode) || {};

      const updatedTelemetry = {
        ...existing,
        active: true,
        lastSeen: now,
        batteryLevel: payload.batteryLevel ?? existing.batteryLevel ?? 100,
        isCharging: payload.isCharging ?? existing.isCharging ?? false,
        networkType: payload.networkType || existing.networkType || 'WiFi',
        networkName: payload.networkName || existing.networkName || 'Connected',
      };

      onlineDevices.set(currentDeviceCode, updatedTelemetry);

      // Async DB heartbeat update
      Device.updateOne(
        { deviceCode: currentDeviceCode },
        {
          $set: {
            state: true,
            lastSeen: new Date(),
            batteryLevel: updatedTelemetry.batteryLevel,
            isCharging: updatedTelemetry.isCharging,
            networkType: updatedTelemetry.networkType,
          },
        }
      ).catch(() => {});

      io.emit('device:heartbeat_update', { deviceCode: currentDeviceCode, telemetry: updatedTelemetry });
    });

    // Handle Disconnect
    socket.on('disconnect', async () => {
      if (currentDeviceCode) {
        console.log(`[Socket] Device disconnected: ${currentDeviceCode}`);
        const existing = onlineDevices.get(currentDeviceCode);
        if (existing && existing.socketId === socket.id) {
          onlineDevices.set(currentDeviceCode, { ...existing, active: false, lastSeen: new Date().toISOString() });
          
          await Device.updateOne({ deviceCode: currentDeviceCode }, { $set: { state: false, lastSeen: new Date() } }).catch(() => {});
          
          io.emit('device:status_change', { deviceCode: currentDeviceCode, state: false, lastSeen: new Date().toISOString() });
        }
      }
    });
  });

  return io;
};

const getOnlineDevices = () => onlineDevices;

module.exports = { initSocket, getOnlineDevices };
