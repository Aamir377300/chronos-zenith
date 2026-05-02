import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, type Task } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export const useTasksQuery = (date: string) => {
  return useQuery<Task[]>({
    queryKey: ['tasks', date],
    queryFn: () => tasksApi.getByDate(date),
    staleTime: 30_000,
  });
};

export const useTasksRangeQuery = (start: string, end: string) => {
  return useQuery<Task[]>({
    queryKey: ['tasks', 'range', start, end],
    queryFn: () => tasksApi.getByRange(start, end),
    staleTime: 30_000,
  });
};

export const useCreateTask = (date: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; date?: string }) =>
      tasksApi.create({ ...payload, date: payload.date || date }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useToggleTask = (date: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.toggle(id),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
    },
    onSuccess: ({ currentStreak, totalRating, totalTasksCompleted, totalTasksAssigned }) => {
      useAuthStore.getState().updateUser({ currentStreak, totalRating, totalTasksCompleted, totalTasksAssigned });
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useDeleteTask = (date: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title, date }: { id: string; title: string; date: string }) =>
      tasksApi.update(id, { title, date }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};
