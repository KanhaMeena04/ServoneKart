import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../core/constants/api_constansts.dart';
import 'platform_config_service.dart';

class RiderSocketService {
  static io.Socket? _socket;
  static String? _joinedRiderId;
  static final StreamController<Map<String, dynamic>> _orderEventsController =
      StreamController<Map<String, dynamic>>.broadcast();

  static Stream<Map<String, dynamic>> get onOrderEvent =>
      _orderEventsController.stream;

  static String get _socketBaseUrl => ApiConstants.socketUrl;

  static void connect({String? riderId}) {
    if (_socket == null) {
      _socket = io.io(
        _socketBaseUrl,
        io.OptionBuilder()
            .setTransports(['websocket', 'polling'])
            .enableAutoConnect()
            .enableReconnection()
            .build(),
      );

      _socket!.onConnect((_) {
        debugPrint('RiderSocket connected: ${_socket?.id}');
        if (_joinedRiderId != null && _joinedRiderId!.isNotEmpty) {
          _socket!.emit('joinRider', _joinedRiderId);
        }
      });

      _socket!.on('platformModeUpdated', (data) {
        PlatformConfigService.applySocketUpdate(data);
      });

      _socket!.on('settingsUpdated', (data) {
        PlatformConfigService.applySocketUpdate(data);
      });

      void emitOrder(String eventName, dynamic data) {
        if (data is Map) {
          _orderEventsController.add({
            'event': eventName,
            ...Map<String, dynamic>.from(data),
          });
        } else {
          _orderEventsController.add({'event': eventName, 'data': data});
        }
      }

      for (final evt in const [
        'order:available',
        'order:assigned',
        'order:new_request',
        'order_update',
        'delivery_status_updated',
        'order:pickup_verified',
        'orderStatusUpdated',
        'rider:duty_status',
        'duty_status_changed',
      ]) {
        _socket!.on(evt, (data) => emitOrder(evt, data));
      }
    } else if (!_socket!.connected) {
      _socket!.connect();
    }

    if (riderId != null && riderId.isNotEmpty) {
      joinRiderRoom(riderId);
    }
  }

  static void joinRiderRoom(String riderId) {
    if (riderId.isEmpty) return;
    _joinedRiderId = riderId;
    if (_socket == null) {
      connect(riderId: riderId);
      return;
    }
    if (_socket!.connected) {
      _socket!.emit('joinRider', riderId);
    }
  }

  static void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _joinedRiderId = null;
  }
}

