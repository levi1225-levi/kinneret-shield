import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

final authServiceProvider = Provider((ref) => AuthService());

final currentUserProvider = StateNotifierProvider<CurrentUserNotifier, AsyncValue<User?>>((ref) {
  final authService = ref.watch(authServiceProvider);
  return CurrentUserNotifier(authService);
});

final authTokenProvider = StateNotifierProvider<AuthTokenNotifier, AsyncValue<String?>>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthTokenNotifier(authService);
});

class CurrentUserNotifier extends StateNotifier<AsyncValue<User?>> {
  final AuthService _authService;

  CurrentUserNotifier(this._authService) : super(const AsyncValue.loading()) {
    _loadCurrentUser();
  }

  Future<void> _loadCurrentUser() async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.getCurrentUser();
      state = AsyncValue.data(user);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> signInWithGoogle() async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.signInWithGoogle();
      state = AsyncValue.data(user);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> registerWithInviteCode(String inviteCode, String role) async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.registerWithInviteCode(inviteCode, role);
      state = AsyncValue.data(user);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> signOut() async {
    try {
      await _authService.signOut();
      state = const AsyncValue.data(null);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> refreshUser() async {
    try {
      final user = await _authService.getCurrentUser();
      state = AsyncValue.data(user);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

class AuthTokenNotifier extends StateNotifier<AsyncValue<String?>> {
  final AuthService _authService;

  AuthTokenNotifier(this._authService) : super(const AsyncValue.loading()) {
    _loadToken();
  }

  Future<void> _loadToken() async {
    state = const AsyncValue.loading();
    try {
      final token = await _authService.getToken();
      state = AsyncValue.data(token);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> refreshToken() async {
    try {
      final token = await _authService.getToken();
      state = AsyncValue.data(token);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

final isAuthenticatedProvider = Provider<bool>((ref) {
  final userAsync = ref.watch(currentUserProvider);
  return userAsync.maybeWhen(
    data: (user) => user != null,
    orElse: () => false,
  );
});

final userRoleProvider = Provider<UserRole?>((ref) {
  final userAsync = ref.watch(currentUserProvider);
  return userAsync.maybeWhen(
    data: (user) => user?.role,
    orElse: () => null,
  );
});
