import 'package:flutter/foundation.dart';
import '../services/settings_api_service.dart';
import '../services/socket_service.dart';

class PlatformConfigProvider with ChangeNotifier {
  String _platformMode = 'grocery';
  String _activeCustomerVertical = 'grocery';
  String _appName = 'Tricelyn';
  bool _isCodEnabled = true;
  bool _isLoaded = false;
  bool _isLoading = false;
  bool _socketAttached = false;

  PlatformConfigProvider() {
    _attachSocketListeners();
    refresh();
  }

  String get platformMode => _platformMode;

  String get activeCustomerVertical {
    if (_platformMode == 'food') return 'food';
    if (_platformMode == 'both') return _activeCustomerVertical;
    return 'grocery';
  }

  bool get isGroceryOnly => _platformMode == 'grocery';
  bool get isFoodOnly => _platformMode == 'food';
  bool get isBothMode => _platformMode == 'both';
  bool get isGroceryActive => activeCustomerVertical == 'grocery';
  bool get isFoodActive => activeCustomerVertical == 'food';
  String get appName => _appName;
  bool get isCodEnabled => _isCodEnabled;
  bool get isLoaded => _isLoaded;
  bool get isLoading => _isLoading;

  void _applyMode(String? rawMode) {
    final normalized = (rawMode ?? 'grocery').toString().trim().toLowerCase();
    if (normalized == 'food' || normalized == 'both' || normalized == 'grocery') {
      _platformMode = normalized;
    } else {
      _platformMode = 'grocery';
    }

    if (_platformMode == 'food') {
      _activeCustomerVertical = 'food';
    } else if (_platformMode == 'grocery') {
      _activeCustomerVertical = 'grocery';
    } else if (_activeCustomerVertical != 'food' && _activeCustomerVertical != 'grocery') {
      _activeCustomerVertical = 'grocery';
    }
  }

  void _attachSocketListeners() {
    if (_socketAttached) return;
    _socketAttached = true;
    try {
      SocketService.on('platformModeUpdated', (data) {
        if (data is Map) {
          _applyMode(data['platformMode']?.toString());
          notifyListeners();
        }
      });
      SocketService.on('settingsUpdated', (data) {
        if (data is Map) {
          if (data['platformMode'] != null) {
            _applyMode(data['platformMode'].toString());
          }
          if (data['appName'] != null && data['appName'].toString().trim().isNotEmpty) {
            _appName = data['appName'].toString().trim();
          }
          if (data['isCodEnabled'] != null) {
            _isCodEnabled = data['isCodEnabled'] != false;
          }
          notifyListeners();
        }
      });
    } catch (e) {
      debugPrint('PlatformConfigProvider socket attach error: $e');
    }
  }

  Future<void> refresh() async {
    _isLoading = true;
    try {
      final settings = await SettingsApiService.fetchSettings();
      if (settings != null) {
        _applyMode(settings['platformMode']?.toString());
        final name = settings['appName']?.toString().trim();
        if (name != null && name.isNotEmpty) {
          _appName = name;
        }
        if (settings['isCodEnabled'] != null) {
          _isCodEnabled = settings['isCodEnabled'] != false;
        }
        _isLoaded = true;
      }
    } catch (e) {
      debugPrint('PlatformConfigProvider refresh error: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setActiveVertical(String vertical) {
    if (_platformMode != 'both') return;
    if (vertical == 'grocery' || vertical == 'food') {
      if (_activeCustomerVertical != vertical) {
        _activeCustomerVertical = vertical;
        notifyListeners();
      }
    }
  }

  @override
  void dispose() {
    SocketService.off('platformModeUpdated');
    SocketService.off('settingsUpdated');
    super.dispose();
  }
}
