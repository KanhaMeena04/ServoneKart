import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? 'https://servonekart.onrender.com' : 'http://localhost:5000');

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(userId = null) {
    if (this.socket && this.socket.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      this.connected = true;
      if (userId) {
        this.socket.emit('joinUser', userId);
        this.socket.emit('joinCustomer', userId);
      }
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
    });

    return this.socket;
  }

  joinOrder(orderId) {
    if (!this.socket) this.connect();
    if (orderId) {
      this.socket.emit('joinOrder', orderId);
      this.socket.emit('joinRoom', `order_${orderId}`);
    }
  }

  leaveOrder(orderId) {
    if (this.socket && orderId) {
      this.socket.emit('leaveOrder', orderId);
    }
  }

  onOrderStatusUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.on('orderStatusUpdated', callback);
    this.socket.on('orderStatusUpdate', callback);
    this.socket.on('orderUpdate', callback);
    this.socket.on('order_updated', callback);
  }

  onRiderLocationUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.on('riderLocationUpdated', callback);
    this.socket.on('driverLocationUpdate', callback);
  }

  onPlatformModeUpdate(callback) {
    if (!this.socket) this.connect();
    this.socket.on('platformModeUpdated', callback);
    this.socket.on('settingsUpdated', callback);
    return () => {
      if (this.socket) {
        this.socket.off('platformModeUpdated', callback);
        this.socket.off('settingsUpdated', callback);
      }
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }
}

export const socketService = new SocketService();
export default socketService;
