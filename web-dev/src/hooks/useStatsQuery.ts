import { useQuery } from '@tanstack/react-query';
import { statsApi, type DailyStats } from '@/lib/api';

export const useStatsQuery = (date: string) => {
  return useQuery<DailyStats>({
    queryKey: ['stats', date],
    queryFn: () => statsApi.getByDate(date),
    staleTime: 30_000,
  });
};

export const useStatsHistory = (limit = 30) => {
  return useQuery({
    queryKey: ['stats', 'history', limit],
    queryFn: () => statsApi.getHistory(limit),
    staleTime: 60_000,
  });
};
