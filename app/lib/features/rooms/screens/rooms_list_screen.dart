import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/providers/room_provider.dart';
import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/loading_widget.dart';
import '../../../shared/widgets/empty_state_widget.dart';
import '../../../shared/widgets/error_widget.dart';

class RoomsListScreen extends ConsumerStatefulWidget {
  const RoomsListScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<RoomsListScreen> createState() => _RoomsListScreenState();
}

class _RoomsListScreenState extends ConsumerState<RoomsListScreen> {
  late TextEditingController _searchController;
  bool _isGridView = true;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final roomsAsync = ref.watch(roomsListProvider);

    return AppScaffold(
      title: 'Rooms',
      body: Column(
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.all(16),
            color: AppConstants.neutralGray,
            child: Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _searchController,
                    decoration: InputDecoration(
                      hintText: 'Search rooms...',
                      prefixIcon: const Icon(Icons.search),
                    ),
                    onChanged: (value) {
                      if (value.isEmpty) {
                        ref.read(roomsListProvider.notifier).refreshRooms();
                      } else {
                        ref.read(roomsListProvider.notifier).searchRooms(value);
                      }
                    },
                  ),
                ),
                const SizedBox(width: 12),
                IconButton(
                  onPressed: () {
                    setState(() {
                      _isGridView = !_isGridView;
                    });
                  },
                  icon: Icon(
                    _isGridView ? Icons.list : Icons.grid_view,
                  ),
                ),
              ],
            ),
          ),

          // List
          Expanded(
            child: roomsAsync.when(
              loading: () => const LoadingWidget(),
              error: (error, stack) => ErrorStateWidget(
                message: error.toString(),
                onRetry: () {
                  ref.invalidate(roomsListProvider);
                },
              ),
              data: (rooms) {
                if (rooms.isEmpty) {
                  return EmptyStateWidget(
                    title: 'No Rooms Found',
                    subtitle: 'Try adjusting your search',
                    icon: Icons.meeting_room,
                  );
                }

                if (_isGridView) {
                  return GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 0.9,
                    ),
                    itemCount: rooms.length,
                    itemBuilder: (context, index) {
                      final room = rooms[index];
                      return _buildRoomGridCard(context, room);
                    },
                  );
                } else {
                  return ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: rooms.length,
                    itemBuilder: (context, index) {
                      final room = rooms[index];
                      return _buildRoomListCard(context, room);
                    },
                  );
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoomGridCard(BuildContext context, dynamic room) {
    final occupancyPercent =
        ((room.currentOccupancy ?? 0) / (room.capacity ?? 1)).clamp(0.0, 1.0);

    return GestureDetector(
      onTap: () => context.go('/rooms/${room.id}'),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Icon(
                    Icons.meeting_room,
                    color: AppConstants.primaryBlue,
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: occupancyPercent > 0.8
                          ? AppConstants.lateYellow.withOpacity(0.2)
                          : AppConstants.presentGreen.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${(occupancyPercent * 100).toStringAsFixed(0)}%',
                      style: TextStyle(
                        color: occupancyPercent > 0.8
                            ? AppConstants.lateYellow
                            : AppConstants.presentGreen,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                room.name ?? 'Room',
                style: Theme.of(context).textTheme.titleLarge,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                'Floor ${room.floor ?? 0}',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppConstants.darkGray.withOpacity(0.6),
                ),
              ),
              const Spacer(),
              LinearProgressIndicator(
                value: occupancyPercent,
                minHeight: 6,
                backgroundColor: AppConstants.neutralGray,
                valueColor: AlwaysStoppedAnimation(
                  occupancyPercent > 0.8
                      ? AppConstants.lateYellow
                      : AppConstants.presentGreen,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                '${room.currentOccupancy ?? 0}/${room.capacity ?? 0}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRoomListCard(BuildContext context, dynamic room) {
    final occupancyPercent =
        ((room.currentOccupancy ?? 0) / (room.capacity ?? 1)).clamp(0.0, 1.0);

    return GestureDetector(
      onTap: () => context.go('/rooms/${room.id}'),
      child: Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          room.name ?? 'Room',
                          style: Theme.of(context).textTheme.titleLarge,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${room.building ?? 'Building'} - Floor ${room.floor ?? 0}',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: AppConstants.darkGray.withOpacity(0.6),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: occupancyPercent > 0.8
                          ? AppConstants.lateYellow.withOpacity(0.2)
                          : AppConstants.presentGreen.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${room.currentOccupancy ?? 0}/${room.capacity ?? 0}',
                      style: TextStyle(
                        color: occupancyPercent > 0.8
                            ? AppConstants.lateYellow
                            : AppConstants.presentGreen,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              LinearProgressIndicator(
                value: occupancyPercent,
                minHeight: 8,
                backgroundColor: AppConstants.neutralGray,
                valueColor: AlwaysStoppedAnimation(
                  occupancyPercent > 0.8
                      ? AppConstants.lateYellow
                      : AppConstants.presentGreen,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
