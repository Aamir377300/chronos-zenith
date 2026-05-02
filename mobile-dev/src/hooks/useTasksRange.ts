import { useState, useEffect, useCallback } from 'react';
import { tasksApi, statsApi, type Task, type DailyStats } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export const useTasksRange = (start: string, end: string, selectedDate: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const [freshTasks, freshStats] = await Promise.all([
        tasksApi.getByRange(start, end),
        statsApi.getByDate(selectedDate),
      ]);

      setTasks(freshTasks);
      setStats(freshStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [start, end, selectedDate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const toggleTask = async (id: string, taskDate: string) => {
    // Optimistic toggle
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, isCompleted: !t.isCompleted } : t))
    );
    try {
      const { task: updatedTask, currentStreak, totalRating, totalTasksCompleted, totalTasksAssigned } = await tasksApi.toggle(id);

      // Update user fields directly from toggle response
      useAuthStore.getState().updateUser({ currentStreak, totalRating, totalTasksCompleted, totalTasksAssigned });

      // Update the task in state with server response
      setTasks((prev) => prev.map((t) => (t._id === id ? updatedTask : t)));

      // Refresh stats for the selected date
      const freshStats = await statsApi.getByDate(selectedDate);
      setStats(freshStats);
    } catch {
      // Revert optimistic update on error
      setTasks((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isCompleted: !t.isCompleted } : t))
      );
    }
  };

  const addTask = async (title: string, schedule: string) => {
    const newTask = await tasksApi.create({ title, date: schedule });
    setTasks((prev) =>
      [...prev, newTask].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    );
    if (schedule === selectedDate) {
      const freshStats = await statsApi.getByDate(selectedDate);
      setStats(freshStats);
    }
  };

  const removeTask = async (id: string, taskDate: string) => {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t._id !== id));
    try {
      await tasksApi.delete(id);
      if (taskDate === selectedDate) {
        const freshStats = await statsApi.getByDate(selectedDate);
        setStats(freshStats);
      }
    } catch {
      setTasks(previous);
    }
  };

  const updateTask = async (id: string, title: string, date: string) => {
    const previous = tasks;
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, title, date } : t)));
    try {
      const updatedTask = await tasksApi.update(id, { title, date });
      setTasks((prev) => prev.map((t) => (t._id === id ? updatedTask : t)));
      const freshStats = await statsApi.getByDate(selectedDate);
      setStats(freshStats);
    } catch {
      setTasks(previous);
    }
  };

  return { tasks, stats, loading, error, toggleTask, addTask, removeTask, updateTask, refresh: fetchTasks };
};
