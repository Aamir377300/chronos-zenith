import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { useTasksRange } from '@/hooks/useTasksRange';
import { useAuthStore } from '@/store/authStore';
import { TimelineItem } from '@/components/TimelineItem';
import { ScoreWidget } from '@/components/ScoreWidget';
import { AddTaskSheet } from '@/components/AddTaskSheet';
import { CalendarStrip } from '@/components/CalendarStrip';
import { RatingBadge } from '@/components/RatingBadge';
import { useWidgetSync } from '@/hooks/useWidgetSync';
import { todayString, formatDisplayDate } from '@/utils/dateHelpers';
import { format, subDays, addDays } from 'date-fns';
import { type Task } from '@/lib/api';

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const actualToday = todayString();
  const [selectedDate, setSelectedDate] = useState(actualToday);
  
  const start = format(subDays(new Date(selectedDate), 14), 'yyyy-MM-dd');
  const end = format(addDays(new Date(selectedDate), 14), 'yyyy-MM-dd');
  const { tasks, stats, loading, error, toggleTask, addTask, removeTask, updateTask, refresh } = useTasksRange(start, end, selectedDate);
  
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // ── Widget sync ────────────────────────────────────────────────────────────
  const { syncWidgets, refreshWidgets } = useWidgetSync();

  // Helper: push today's data to widgets
  const pushToWidgets = useCallback(() => {
    if (selectedDate !== actualToday) return;
    const todayTasks = tasks.filter((t) => t.date === actualToday);
    syncWidgets(
      todayTasks,
      stats,
      user?.currentStreak ?? 0,
      user?.totalRating ?? 0,
      user?.totalTasksCompleted ?? 0,
      user?.totalTasksAssigned ?? 0,
      actualToday,
    );
  }, [tasks, stats, user, actualToday, selectedDate, syncWidgets]);

  // Sync whenever tasks or stats change
  useEffect(() => {
    if (!loading) {
      pushToWidgets();
    }
  }, [tasks, stats, loading, pushToWidgets]);

  // Refresh widget UI when app comes to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refreshWidgets();
      }
    });
    return () => sub.remove();
  }, [refreshWidgets]);
  // ── End widget sync ────────────────────────────────────────────────────────

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const sections = React.useMemo(() => {
    // Filter tasks for ONLY the selected date
    const tasksForSelectedDate = tasks.filter(task => task.date === selectedDate);
    
    if (tasksForSelectedDate.length === 0) {
      return [];
    }

    return [{
      title: selectedDate,
      data: tasksForSelectedDate,
      isToday: selectedDate === actualToday,
    }];
  }, [tasks, selectedDate, actualToday]);

  const renderTask = ({ item, index, section }: { item: Task; index: number, section: any }) => (
    <TimelineItem
      task={item}
      onToggle={(id) => toggleTask(id, item.date)}
      onDelete={(id) => removeTask(id, item.date)}
      onEdit={() => {
        setEditingTask(item);
        setShowAddSheet(true);
      }}
      isLast={index === section.data.length - 1}
    />
  );

  const renderSectionHeader = ({ section }: any) => {
    const isToday = section.isToday;
    
    if (isToday) {
      return (
        <View style={styles.todayHeader}>
          <Text style={styles.todayHeaderText}>
            Today • {format(new Date(section.title), 'MMMM d')}
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.pastDateHeader}>
        <Text style={styles.pastDateText}>
          {format(new Date(section.title), 'EEEE, MMMM d')}
        </Text>
      </View>
    );
  };

  const renderSectionFooter = () => {
    // Minimal spacing between sections
    return <View style={{ height: 16 }} />;
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.dateLabel}>Timeline</Text>
          <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
        </View>
        <View style={styles.headerRight}>
          <RatingBadge
            completed={user?.totalTasksCompleted ?? 0}
            assigned={user?.totalTasksAssigned ?? 0}
            rating={user?.totalRating ?? 0}
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setEditingTask(null);
              setShowAddSheet(true);
            }}
            accessibilityLabel="Add task"
            accessibilityRole="button"
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Strip */}
      <CalendarStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      {/* Score widget */}
      <ScoreWidget stats={stats} streak={user?.currentStreak ?? 0} />

      {/* Timeline */}
      {loading && tasks.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.blue} size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item._id}
          renderItem={renderTask}
          renderSectionHeader={renderSectionHeader}
          renderSectionFooter={renderSectionFooter}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.blue} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyText}>No tasks yet. Tap + to add one.</Text>
            </View>
          }
        />
      )}

      {/* Add/Edit Task Sheet */}
      <AddTaskSheet
        visible={showAddSheet}
        onClose={() => {
          setShowAddSheet(false);
          setEditingTask(null);
        }}
        onAdd={(title, schedule) => addTask(title, schedule || selectedDate)}
        onEdit={updateTask}
        editingTask={editingTask}
        initialDate={selectedDate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addBtnText: { color: Colors.white, fontSize: 24, lineHeight: 28, fontWeight: '300' },
  logoutBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  logoutText: { fontSize: 12, color: Colors.textMuted },
  listContent: { paddingTop: 12, paddingBottom: 40 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.danger, fontSize: 14, marginBottom: 12 },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.blue,
    borderRadius: 10,
  },
  retryText: { color: Colors.white, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },
  todayHeader: {
    backgroundColor: Colors.background,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.blue,
    marginBottom: 8,
  },
  todayHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  pastDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  pastDateText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
