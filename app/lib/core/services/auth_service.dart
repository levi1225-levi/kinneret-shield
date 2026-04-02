import 'package:google_sign_in/google_sign_in.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../constants/app_constants.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService {
  static final AuthService _instance = AuthService._internal();

  late GoogleSignIn _googleSignIn;
  late ApiService _apiService;

  factory AuthService() {
    return _instance;
  }

  AuthService._internal() {
    _apiService = ApiService();
    _googleSignIn = GoogleSignIn(
      clientId: AppConstants.googleClientId,
      scopes: ['email', 'profile'],
    );
  }

  Future<User?> signInWithGoogle() async {
    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;

      if (idToken == null) return null;

      // Exchange Google token for your backend JWT
      final response = await _apiService.post<Map<String, dynamic>>(
        '/auth/google/signin',
        data: {'idToken': idToken},
      );

      final token = response['token'] as String;
      final userData = response['user'] as Map<String, dynamic>;

      await _apiService.setToken(token);

      return User.fromJson(userData);
    } catch (e) {
      rethrow;
    }
  }

  Future<User?> registerWithInviteCode(
    String inviteCode,
    String role,
  ) async {
    try {
      final googleUser = await _googleSignIn.signIn();
      if (googleUser == null) return null;

      final googleAuth = await googleUser.authentication;
      final idToken = googleAuth.idToken;

      if (idToken == null) return null;

      // Register with invite code
      final response = await _apiService.post<Map<String, dynamic>>(
        '/auth/register',
        data: {
          'inviteCode': inviteCode,
          'role': role,
          'idToken': idToken,
        },
      );

      final token = response['token'] as String;
      final userData = response['user'] as Map<String, dynamic>;

      await _apiService.setToken(token);

      return User.fromJson(userData);
    } catch (e) {
      rethrow;
    }
  }

  Future<void> signOut() async {
    try {
      await _apiService.clearToken();
      await _googleSignIn.signOut();
      await Supabase.instance.client.auth.signOut();
    } catch (e) {
      rethrow;
    }
  }

  Future<User?> getCurrentUser() async {
    try {
      final response = await _apiService.get<Map<String, dynamic>>(
        '/auth/me',
      );
      return User.fromJson(response);
    } catch (e) {
      return null;
    }
  }

  Future<bool> verifyToken() async {
    try {
      await _apiService.get('/auth/verify');
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<String?> getToken() async {
    await _apiService.initPrefs();
    return await _apiService._getToken();
  }
}
