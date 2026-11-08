import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  completed: number;
  assigned: number;
}

export const RatingBadge: React.FC<Props> = ({ completed, assigned }) => {
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
});
