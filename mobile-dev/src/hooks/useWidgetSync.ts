/**
 * useWidgetSync
 *
 * Hook that syncs task + stats data to Android home-screen widgets via the
 * WidgetModule native bridge.
 *
 * Call `syncWidgets(tasks, stats, user)` whenever:
 *   - Tasks are loaded / refreshed
 *   - A task is toggled, added, or deleted
 *   - The app comes to the foreground
 *
 * On iOS or Expo Go this is a no-op (the native module won't exist).
 */

import { useCallback } from 'react';
import { NativeModules, Platform } from 'react-native';
import { format } from 'date-fns';
import { type Task, type DailyStats } from '@/lib/api';

// The native module registered in WidgetPackage.java
const { WidgetModule } = NativeModules as {
  WidgetModule?: {
    updateWidgets: (
      tasks: Array<{ title: string; time: string | null; isCompleted: boolean }>,
      stats: {
        completedTasks: number;
        totalTasks: number;
        achievedScore: number;
        totalScore: number;
        bonusApplied: boolean;
      },
      streak: number,
      rating: number,
      totalCompleted: number,
      totalAssigned: number,
      date: string,
    ) => Promise<string>;
    refreshWidgets: () => Promise<string>;
    isWidgetSupported: () => Promise<boolean>;
  };
};

/** True when the native module is available (real Android device / emulator) */
const isSupported = Platform.OS === 'android' && !!WidgetModule;

export function useWidgetSync() {
  /**
   * syncWidgets
   *
   * Pushes today's tasks + stats to the Android widget layer.
   *
   * @param todayTasks  Tasks filtered to today's date
   * @param stats       DailyStats for today (may be null if not yet loaded)
   * @param streak      User's current streak count
   * @param totalRating User's total lifetime rating
   * @param date        Today's date string "YYYY-MM-DD"
   */
  const syncWidgets = useCallback(
    async (
      todayTasks: Task[],
      stats: DailyStats | null,
      streak: number,
      totalRating: number,
      totalCompleted: number,
      totalAssigned: number,
      date?: string,
    ) => {
      if (!isSupported) return;

      const today = date ?? format(new Date(), 'yyyy-MM-dd');

      // Slim down task objects — only send what the widget needs
      const widgetTasks = todayTasks.map((t) => ({
        title: t.title,
        time: t.time ?? null,
        isCompleted: t.isCompleted,
      }));

      const widgetStats = {
        completedTasks: stats?.completedTasks ?? 0,
        totalTasks:     stats?.totalTasks     ?? 0,
        achievedScore:  stats?.achievedScore  ?? 0,
        totalScore:     stats?.totalScore     ?? 0,
        bonusApplied:   stats?.bonusApplied   ?? false,
      };

      try {
        await WidgetModule!.updateWidgets(
          widgetTasks,
          widgetStats,
          streak,
          totalRating,
          totalCompleted,
          totalAssigned,
          today,
        );
      } catch (err) {
        // Widget sync is non-critical — log but don't surface to user
        if (__DEV__) {
          console.warn('[WidgetSync] updateWidgets failed:', err);
        }
      }
    },
    [],
  );

  /** Force-refresh widget UI without changing data */
  const refreshWidgets = useCallback(async () => {
    if (!isSupported) return;
    try {
      await WidgetModule!.refreshWidgets();
    } catch (err) {
      if (__DEV__) {
        console.warn('[WidgetSync] refreshWidgets failed:', err);
      }
    }
  }, []);

  return { syncWidgets, refreshWidgets, isSupported };
}
