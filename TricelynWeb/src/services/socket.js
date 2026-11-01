import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

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
      console.log('⚡ Socket connected to Tricelyn server:', this.socket.id);
      if (userId) {
        this.socket.emit('joinUser', userId);
        this.socket.emit('joinCustomer', userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.log('🔌 Socket disconnected:', reason);
    });

    return this.socket;
  }

  joinOrder(orderId) {
    if (!this.socket) this.connect();
    if (orderId) {
      this.socket.emit('joinOrder', orderId);
      this.socket.emit('joinRoom', `order_${orderId}`);
      console.log(`📦 Joined real-time room for order: ${orderId}`);
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
