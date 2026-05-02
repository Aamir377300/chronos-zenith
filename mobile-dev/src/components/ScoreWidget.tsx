import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { type DailyStats } from '@/lib/api';

interface Props {
  stats: DailyStats | null;
  streak: number;
}

export const ScoreWidget: React.FC<Props> = ({ stats, streak }) => {
  const achieved = stats?.achievedScore ?? 0;
  const total = stats?.totalScore ?? 0;
  const percentage = total > 0 ? Math.min((achieved / total) * 100, 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Score */}
        <View>
          <Text style={styles.label}>Today's Score</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.achieved}>{achieved}</Text>
            <Text style={styles.separator}> / </Text>
            <Text style={styles.total}>{total}</Text>
          </View>
        </View>

        {/* Streak */}
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>{streak} day{streak !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${percentage}%` as `${number}%` }]} />
      </View>

      <View style={styles.footer}>
        {stats?.bonusApplied && (
          <Text style={styles.bonusText}>🎉 Streak bonus +1 applied!</Text>
        )}
        <Text style={styles.percentText}>{Math.round(percentage)}% complete</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  achieved: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  separator: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  total: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.orange,
  },
  progressBg: {
    height: 6,
    backgroundColor: Colors.greyLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.blue,
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  bonusText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
  },
  percentText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 'auto',
  },
});
