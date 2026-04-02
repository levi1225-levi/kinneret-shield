import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  FlatList,
  Text,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../utils/theme';
import {
  StatCard,
  StatusBadge,
  Card,
  EmptyState,
  LoadingScreen,
  ErrorScreen,
  Header,
  FilterChip,
} from '../../components';
import { attendanceAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRecord } from '../../types';

type DateFilter = 'week' | 'month' | 'all';

export const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('week');
  const [presentCount, setPresentCount] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const getDateRange = useCallback((filter: DateFilter) => {
    const today = new Date();
    const startDate = new Date();

    switch (filter) {
      case 'week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'all':
        startDate.setFullYear(1900);
        break;
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
    };
  }, []);

  const fetchData = useCallback(
    async (pageNum: number = 1) => {
      try {
        setError(null);
        if (!user?.id) return;

        const range = getDateRange(dateFilter);
        const data = await attendanceAPI.getStudentAttendance(user.id, {
          page: pageNum,
          limit: 20,
        });

        // Filter by date range
        const filteredRecords = data.items.filter((record) => {
          const recordDate = record.created_at.split('T')[0];
          return recordDate >= range.startDate && recordDate <= range.endDate;
        });

        setRecords(pageNum === 1 ? filteredRecords : [...records, ...filteredRecords]);
        setHasMore(data.page < data.pages);

        if (pageNum === 1) {
          // Calculate stats
          const present = filteredRecords.filter(
            (r) => r.status === 'checked_in' || r.status === 'checked_out' || r.status === 'auto_checked_out'
          ).length;
          const late = filteredRecords.filter((r) => r.status === 'auto_checked_out').length;
          const absent = data.total - present;

          setPresentCount(present);
          setLateCount(late);
          setAbsentCount(absent);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load attendance');
      } finally {
        if (pageNum === 1) {
          setLoading(false);
        }
      }
    },
    [user?.id, dateFilter, getDateRange, records]
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setRecords([]);
    fetchData(1);
  }, [dateFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setRecords([]);
    await fetchData(1);
    setRefreshing(false);
  }, [fetchData]);

  const onLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  }, [page, hasMore, loading, fetchData]);

  if (loading) {
    return <LoadingScreen message="Loading your attendance..." />;
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={() => fetchData(1)} />;
  }

  // Group records by date
  const groupedRecords = records.reduce(
    (acc, record) => {
      const date = new Date(record.created_at).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    },
    {} as Record<string, AttendanceRecord[]>
  );

  return (
    <View style={styles.container}>
      <Header title="My Attendance" />

      {/* Filter Chips */}
      <ScrollView style={styles.filterContainer} horizontal showsHorizontalScrollIndicator={false}>
        <FilterChip
          label="This Week"
          isSelected={dateFilter === 'week'}
          onPress={() => setDateFilter('week')}
          color={Colors.primary}
          style={styles.chip}
        />
        <FilterChip
          label="This Month"
          isSelected={dateFilter === 'month'}
          onPress={() => setDateFilter('month')}
          color={Colors.primary}
          style={styles.chip}
        />
        <FilterChip
          label="All Time"
          isSelected={dateFilter === 'all'}
          onPress={() => setDateFilter('all')}
          color={Colors.primary}
          style={styles.chip}
        />
      </ScrollView>

      {/* Stats Row */}
      <ScrollView
        style={styles.statsContainer}
        contentContainerStyle={styles.statsContent}
        scrollEnabled={false}
      >
        <StatCard
          title="Present"
          value={presentCount}
          icon="check-circle"
          color={Colors.attendancePresent}
        />
        <StatCard
          title="Late"
          value={lateCount}
          icon="clock-alert"
          color={Colors.attendanceLate}
        />
        <StatCard
          title="Absent"
          value={absentCount}
          icon="close-circle"
          color={Colors.attendanceAbsent}
        />
      </ScrollView>

      {/* Records List */}
      <FlatList
        data={Object.entries(groupedRecords)}
        keyExtractor={([date]) => date}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-blank"
            title="No records found"
            subtitle={`No attendance records found for the selected period`}
          />
        }
        renderItem={({ item: [date, dateRecords] }) => (
          <View key={date}>
            <Text style={styles.dateHeader}>{date}</Text>
            {dateRecords.map((record) => (
              <Card key={record.id} style={styles.recordCard}>
                <View style={styles.recordContent}>
                  <View style={styles.recordInfo}>
                    <Text style={styles.roomName}>{record.room_name || 'Unknown Room'}</Text>
                    <View style={styles.timesContainer}>
                      {record.check_in_at && (
                        <Text style={styles.timeText}>
                          In: {new Date(record.check_in_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      )}
                      {record.check_out_at && (
                        <Text style={styles.timeText}>
                          Out: {new Date(record.check_out_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      )}
                    </View>
                    {record.duration_minutes && (
                      <Text style={styles.durationText}>
                        Duration: {record.duration_minutes} minutes
                      </Text>
                    )}
                  </View>
                  <StatusBadge
                    label={record.status.replace(/_/g, ' ')}
                    color={getStatusColor(record.status)}
                    size="sm"
                  />
                </View>
              </Card>
            ))}
          </View>
        )}
      />
    </View>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'checked_in':
      return Colors.attendancePresent;
    case 'checked_out':
      return Colors.success;
    case 'auto_checked_out':
      return Colors.warning;
    default:
      return Colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  chip: {
    marginRight: Spacing.md,
  },
  statsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  statsContent: {
    gap: Spacing.md,
  },
  dateHeader: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  recordCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  recordContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  timesContainer: {
    marginBottom: Spacing.sm,
  },
  timeText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  durationText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default StudentAttendance;
