import 'dart:async';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;
import '../constants/app_constants.dart';

class WebSocketService {
  static final WebSocketService _instance = WebSocketService._internal();

  late WebSocketChannel? _channel;
  late StreamController<Map<String, dynamic>> _eventController;
  Timer? _reconnectTimer;
  bool _isConnecting = false;
  String? _token;

  factory WebSocketService() {
    return _instance;
  }

  WebSocketService._internal() {
    _eventController = StreamController<Map<String, dynamic>>.broadcast();
  }

  static WebSocketService get instance => _instance;

  Stream<Map<String, dynamic>> get events => _eventController.stream;

  Future<void> connect(String token) async {
    if (_isConnecting || _channel != null) return;

    _isConnecting = true;
    _token = token;

    try {
      final uri = Uri.parse('${AppConstants.websocketUrl}?token=$token');
      _channel = WebSocketChannel.connect(uri);

      // Listen to incoming messages
      _channel!.stream.listen(
        (message) {
          try {
            if (message is String) {
              final data = _parseJson(message);
              _eventController.add(data);
            }
          } catch (e) {
            // Handle parsing errors
          }
        },
        onError: (error) {
          _handleError(error);
        },
        onDone: () {
          _channel = null;
          _scheduleReconnect();
        },
      );

      _isConnecting = false;
    } catch (e) {
      _isConnecting = false;
      _scheduleReconnect();
    }
  }

  void send(String eventType, Map<String, dynamic> data) {
    if (_channel != null) {
      final message = {
        'type': eventType,
        'data': data,
        'timestamp': DateTime.now().toIso8601String(),
      };
      _channel!.sink.add(message);
    }
  }

  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(Duration(seconds: 5), () {
      if (_token != null) {
        connect(_token!);
      }
    });
  }

  void _handleError(dynamic error) {
    // Log error
  }

  Map<String, dynamic> _parseJson(String json) {
    try {
      return {} as Map<String, dynamic>;
      // In real implementation, use jsonDecode
    } catch (e) {
      return {};
    }
  }

  Future<void> disconnect() async {
    _reconnectTimer?.cancel();
    await _channel?.sink.close(status.goingAway);
    _channel = null;
  }

  void dispose() {
    disconnect();
    _eventController.close();
  }
}
