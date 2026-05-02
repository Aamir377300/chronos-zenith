import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { format, addDays, subDays, startOfDay, isSameDay, parseISO } from 'date-fns';
import { Colors } from '@/constants/colors';

interface Props {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const CalendarStrip: React.FC<Props> = ({ selectedDate, onSelectDate }) => {
  const selected = parseISO(selectedDate);
  const today = startOfDay(new Date());

  // Generate 29 days (14 before, 14 after)
  const dates = Array.from({ length: 29 }).map((_, i) => addDays(subDays(selected, 14), i));
  const flatListRef = useRef<FlatList>(null);

  // Scroll to center initially
  useEffect(() => {
    // wait a frame for layout
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: 14, animated: false, viewPosition: 0.5 });
    }, 100);
  }, []);

  const renderItem = ({ item, index }: { item: Date; index: number }) => {
    const isSelected = isSameDay(item, selected);
    const isToday = isSameDay(item, today);
    const dateStr = format(item, 'yyyy-MM-dd');

    return (
      <TouchableOpacity
        onPress={() => {
          onSelectDate(dateStr);
          // Wait briefly before scrolling so state updates first
          setTimeout(() => {
             flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
          }, 50);
        }}
        style={[
          styles.dayContainer,
          isSelected && styles.dayContainerSelected,
        ]}
      >
        <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
          {format(item, 'EEE')}
        </Text>
        <Text style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}>
          {format(item, 'd')}
        </Text>
        {isToday && !isSelected && <View style={styles.todayDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={dates}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => format(item, 'yyyy-MM-dd')}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        getItemLayout={(_, index) => ({
          length: 64, // 56 width + 8 padding/gap approximation
          offset: 64 * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    marginBottom: 8,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayContainer: {
    width: 56,
    height: 72,
    borderRadius: 16,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayContainerSelected: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    transform: [{ scale: 1.05 }],
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  dayNameSelected: {
    color: '#D1E8FF',
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  dayNumberSelected: {
    color: Colors.white,
  },
  todayDot: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.blue,
  },
});
