import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { type Task } from '@/lib/api';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: () => void;
  isLast: boolean;
}

export const TimelineItem: React.FC<Props> = ({ task, onToggle, onDelete, onEdit, isLast }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onToggle(task._id);
  };

  return (
    <View style={styles.container}>
      {/* Vertical line segment */}
      {!isLast && <View style={styles.line} />}

      {/* Circle indicator */}
      <TouchableOpacity
        onPress={handleToggle}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.isCompleted }}
        accessibilityLabel={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        <Animated.View
          style={[
            styles.circle,
            task.isCompleted && styles.circleCompleted,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          {task.isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </Animated.View>
      </TouchableOpacity>

      {/* Task content */}
      <TouchableOpacity 
        style={styles.content}
        onLongPress={onEdit}
        delayLongPress={500}
        activeOpacity={0.6}
      >
        <Text
          style={[styles.title, task.isCompleted && styles.titleCompleted]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {task.time && (
          <Text style={styles.time}>{task.time}</Text>
        )}
      </TouchableOpacity>

      {/* Delete button */}
      <TouchableOpacity
        onPress={() => onDelete(task._id)}
        style={styles.deleteBtn}
        accessibilityLabel="Delete task"
        accessibilityRole="button"
      >
        <Text style={styles.deleteIcon}>×</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: 34,
    top: 40,
    bottom: -8,
    width: 2,
    backgroundColor: Colors.border,
    zIndex: 0,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  circleCompleted: {
    backgroundColor: Colors.blue,
    borderColor: Colors.blue,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    marginLeft: 12,
    paddingTop: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  time: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },

  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  deleteIcon: {
    fontSize: 20,
    color: Colors.textMuted,
    lineHeight: 22,
  },
});
