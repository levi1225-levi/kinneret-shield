import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_constants.dart';
import '../../core/models/user.dart';
import '../../core/providers/auth_provider.dart';

class AppScaffold extends ConsumerWidget {
  final String title;
  final Widget body;
  final List<Widget>? actions;
  final bool showBottomNav;
  final int? selectedIndex;
  final VoidCallback? onNavIndexChanged;
  final UserRole? role;

  const AppScaffold({
    Key? key,
    required this.title,
    required this.body,
    this.actions,
    this.showBottomNav = true,
    this.selectedIndex,
    this.onNavIndexChanged,
    this.role,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isMobile = MediaQuery.of(context).size.width < 600;
    final currentRole = role ?? ref.watch(userRoleProvider);

    if (isMobile) {
      return _buildMobileScaffold(context, ref, currentRole);
    } else {
      return _buildTabletScaffold(context, ref, currentRole);
    }
  }

  Widget _buildMobileScaffold(BuildContext context, WidgetRef ref, UserRole? currentRole) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: actions,
        elevation: 0,
      ),
      body: body,
      bottomNavigationBar: showBottomNav
          ? _buildBottomNavigationBar(context, ref, currentRole)
          : null,
    );
  }

  Widget _buildTabletScaffold(BuildContext context, WidgetRef ref, UserRole? currentRole) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
        actions: actions,
        elevation: 0,
      ),
      body: Row(
        children: [
          _buildSideNavigation(context, ref, currentRole),
          Expanded(child: body),
        ],
      ),
    );
  }

  Widget _buildBottomNavigationBar(BuildContext context, WidgetRef ref, UserRole? currentRole) {
    List<BottomNavigationBarItem> items = _getNavItems(currentRole);

    return BottomNavigationBar(
      currentIndex: selectedIndex ?? 0,
      onTap: (index) {
        onNavIndexChanged?.call();
        _navigateByIndex(context, index, currentRole);
      },
      items: items,
      type: BottomNavigationBarType.fixed,
      backgroundColor: AppConstants.primaryBlue,
      selectedItemColor: AppConstants.neutralWhite,
      unselectedItemColor: AppConstants.neutralWhite.withOpacity(0.7),
    );
  }

  Widget _buildSideNavigation(BuildContext context, WidgetRef ref, UserRole? currentRole) {
    List<BottomNavigationBarItem> items = _getNavItems(currentRole);

    return NavigationRail(
      selectedIndex: selectedIndex ?? 0,
      onDestinationSelected: (index) {
        onNavIndexChanged?.call();
        _navigateByIndex(context, index, currentRole);
      },
      destinations: items
          .map((item) => NavigationRailDestination(
                icon: item.icon,
                label: Text(item.label),
              ))
          .toList(),
      backgroundColor: AppConstants.primaryBlue,
      selectedLabelTextStyle: const TextStyle(
        color: AppConstants.neutralWhite,
        fontWeight: FontWeight.bold,
      ),
      unselectedLabelTextStyle: TextStyle(
        color: AppConstants.neutralWhite.withOpacity(0.7),
      ),
    );
  }

  List<BottomNavigationBarItem> _getNavItems(UserRole? role) {
    switch (role) {
      case UserRole.student:
        return [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Dashboard',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.event),
            label: 'Schedule',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ];
      case UserRole.teacher:
        return [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Dashboard',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.people),
            label: 'Students',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.bell),
            label: 'Alerts',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ];
      case UserRole.securityGuard:
        return [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Dashboard',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.lock),
            label: 'Access',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.warning),
            label: 'Alerts',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ];
      case UserRole.management:
        return [
          const BottomNavigationBarItem(
            icon: Icon(Icons.analytics),
            label: 'Analytics',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.settings),
            label: 'Admin',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ];
      case UserRole.parent:
        return [
          const BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Dashboard',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ];
      default:
        return [];
    }
  }

  void _navigateByIndex(BuildContext context, int index, UserRole? role) {
    switch (role) {
      case UserRole.student:
        if (index == 0) context.go('/dashboard/student');
        if (index == 1) context.go('/attendance');
        if (index == 2) context.go('/profile');
        break;
      case UserRole.teacher:
        if (index == 0) context.go('/dashboard/teacher');
        if (index == 1) context.go('/rooms');
        if (index == 2) context.go('/alerts');
        if (index == 3) context.go('/profile');
        break;
      case UserRole.securityGuard:
        if (index == 0) context.go('/dashboard/security');
        if (index == 1) context.go('/devices');
        if (index == 2) context.go('/alerts');
        if (index == 3) context.go('/profile');
        break;
      case UserRole.management:
        if (index == 0) context.go('/dashboard/management');
        if (index == 1) context.go('/admin');
        if (index == 2) context.go('/profile');
        break;
      case UserRole.parent:
        if (index == 0) context.go('/dashboard/parent');
        if (index == 1) context.go('/profile');
        break;
      default:
        break;
    }
  }
}
