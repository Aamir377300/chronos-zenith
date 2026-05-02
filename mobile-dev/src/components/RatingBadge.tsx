import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  completed: number;
  assigned: number;
  rating: number;
}

export const RatingBadge: React.FC<Props> = ({ completed, assigned, rating }) => {
  const pct = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;

  const color =
    pct >= 80 ? Colors.success :
    pct >= 50 ? Colors.warning :
    Colors.danger;

  return (
    <View style={styles.container}>
      <View style={[styles.pill, { borderColor: color }]}>
        <Text style={[styles.fraction, { color }]}>
          {completed}<Text style={styles.slash}>/</Text>{assigned}
        </Text>
      </View>
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingLabel}>Rating</Text>
        <Text style={[styles.ratingValue, { color: Colors.blue }]}>{rating}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fraction: {
    fontSize: 14,
    fontWeight: '800',
  },
  slash: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.6,
  },
  ratingContainer: {
    alignItems: 'flex-start',
  },
  ratingLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  ratingValue: {
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 18,
  },
});
