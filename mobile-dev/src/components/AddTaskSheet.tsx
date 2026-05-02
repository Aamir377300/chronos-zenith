import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { format } from 'date-fns';
import { CalendarStrip } from './CalendarStrip';
import { type Task } from '@/lib/api';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (title: string, date?: string) => Promise<void>;
  onEdit?: (id: string, title: string, date: string) => Promise<void>;
  editingTask?: Task | null;
  initialDate?: string;
}

export const AddTaskSheet: React.FC<Props> = ({ visible, onClose, onAdd, onEdit, editingTask, initialDate }) => {
  const [title, setTitle] = useState('');
  const [schedule, setSchedule] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (visible && editingTask) {
      setTitle(editingTask.title);
      setSchedule(editingTask.date);
    } else if (visible && !editingTask) {
      setTitle('');
      setSchedule(initialDate || format(new Date(), 'yyyy-MM-dd'));
    }
  }, [visible, editingTask, initialDate]);

  const handleAdd = async () => {
    if (!title.trim()) {
      setError('Please enter a task title');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (editingTask && onEdit) {
        await onEdit(editingTask._id, title.trim(), schedule);
      } else {
        await onAdd(title.trim(), schedule);
      }
      setTitle('');
      setSchedule(format(new Date(), 'yyyy-MM-dd'));
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${editingTask ? 'update' : 'add'} task`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.heading}>{editingTask ? 'Edit Task' : 'Add Task'}</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.fieldLabel}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What do you need to do?"
            placeholderTextColor={Colors.textMuted}
            autoFocus
            returnKeyType="next"
          />

          <Text style={styles.fieldLabel}>Schedule</Text>
          <View style={{ marginHorizontal: -24 }}>
            <CalendarStrip selectedDate={schedule} onSelectDate={setSchedule} />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, loading && styles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <Text style={styles.addText}>{editingTask ? 'Save Changes' : 'Add Task'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  error: {
    fontSize: 13,
    color: Colors.danger,
    marginBottom: 12,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  addBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.blue,
    borderRadius: 12,
    alignItems: 'center',
  },
  addBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  addText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
});
