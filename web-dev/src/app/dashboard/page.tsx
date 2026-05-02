'use client';


import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Timeline } from '@/components/Timeline';
import { ScoreCard } from '@/components/ScoreCard';
import { useState, useMemo, useEffect } from 'react';
import { useTodayDate } from '@/hooks/useTodayDate';
import { useTasksQuery, useTasksRangeQuery } from '@/hooks/useTasksQuery';
import { useStatsQuery } from '@/hooks/useStatsQuery';

export default function DashboardPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const initialToday = useTodayDate();
  const [selectedDate, setSelectedDate] = useState(initialToday);
  const start = useMemo(() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  }, [selectedDate]);
  const end = useMemo(() => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  }, [selectedDate]);

  const { data: tasks = [], isLoading: tasksLoading } = useTasksRangeQuery(start, end);
  const { data: stats } = useStatsQuery(selectedDate);

  useEffect(() => {
    if (hasHydrated && !token) {
      router.push('/login');
    }
  }, [token, hasHydrated, router]);

  // Wait for hydration before checking auth
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <DashboardHeader date={selectedDate} onDateChange={setSelectedDate} />

        <div className="mt-6">
          <ScoreCard
            achievedScore={stats?.achievedScore ?? 0}
            totalScore={stats?.totalScore ?? 0}
            streak={stats?.bonusApplied ? '🔥 Streak Bonus!' : undefined}
          />
        </div>

        <div className="mt-6">
          {tasksLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <Timeline tasks={tasks} selectedDate={selectedDate} />
          )}
        </div>
      </div>
    </div>
  );
}
