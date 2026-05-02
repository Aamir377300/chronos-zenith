import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { statsApi, type DailyStats } from '@/lib/api';
import { format, parseISO } from 'date-fns';

interface HistoryData {
  history: DailyStats[];
  currentStreak: number;
  lastCompletedDate: string | null;
}

export default function AnalyticsScreen() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const result = await statsApi.getHistory(14);
      setData(result);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const totalCompleted = data?.history.reduce((sum, d) => sum + d.completedTasks, 0) ?? 0;
  const totalTasks = data?.history.reduce((sum, d) => sum + d.totalTasks, 0) ?? 0;
  const overallPct = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchHistory} tintColor={Colors.blue} />
        }
      >
        <Text style={styles.heading}>Analytics</Text>

        {loading && !data ? (
          <ActivityIndicator color={Colors.blue} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Summary cards */}
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{data?.currentStreak ?? 0}</Text>
                <Text style={styles.summaryLabel}>🔥 Current Streak</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{overallPct}%</Text>
                <Text style={styles.summaryLabel}>✅ Completion Rate</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{totalCompleted}</Text>
                <Text style={styles.summaryLabel}>📋 Tasks Done</Text>
              </View>
            </View>

            {/* History list */}
            <Text style={styles.sectionTitle}>Last 14 Days</Text>
            {data?.history.length === 0 ? (
              <Text style={styles.emptyText}>No history yet. Start completing tasks!</Text>
            ) : (
              data?.history.map((stat) => (
                <HistoryRow key={stat.date} stat={stat} />
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function HistoryRow({ stat }: { stat: DailyStats }) {
  const pct = stat.totalTasks > 0
    ? Math.round((stat.completedTasks / stat.totalTasks) * 100)
    : 0;
  const isPerfect = stat.totalTasks > 0 && stat.completedTasks === stat.totalTasks;

  return (
    <View style={histStyles.row}>
      <View style={histStyles.dateCol}>
        <Text style={histStyles.dateText}>
          {format(parseISO(stat.date), 'EEE')}
        </Text>
        <Text style={histStyles.dateNum}>
          {format(parseISO(stat.date), 'd MMM')}
        </Text>
      </View>

      <View style={histStyles.barCol}>
        <View style={histStyles.barBg}>
          <View
            style={[
              histStyles.barFill,
              { width: `${pct}%` as `${number}%` },
              isPerfect && histStyles.barPerfect,
            ]}
          />
        </View>
        <Text style={histStyles.pctText}>{pct}%</Text>
      </View>

      <View style={histStyles.scoreCol}>
        <Text style={histStyles.scoreText}>
          {stat.achievedScore}/{stat.totalScore}
        </Text>
        {stat.bonusApplied && <Text style={histStyles.bonusTag}>+bonus</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 16, paddingBottom: 40 },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 20,
  },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});

const histStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  dateCol: { width: 44 },
  dateText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
  dateNum: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  barCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.greyLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.blue,
    borderRadius: 4,
  },
  barPerfect: { backgroundColor: Colors.success },
  pctText: { fontSize: 12, color: Colors.textSecondary, width: 32, textAlign: 'right' },
  scoreCol: { alignItems: 'flex-end', minWidth: 52 },
  scoreText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  bonusTag: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
});
