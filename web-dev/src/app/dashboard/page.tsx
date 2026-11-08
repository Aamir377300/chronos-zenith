'use client';

import { DashboardHeader } from '@/components/DashboardHeader';
import { Timeline } from '@/components/Timeline';
import { ScoreCard } from '@/components/ScoreCard';
import { PasscodeGate } from '@/components/PasscodeGate';
import { useState, useMemo, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTodayDate } from '@/hooks/useTodayDate';
import { useTasksRangeQuery } from '@/hooks/useTasksQuery';
import { useStatsQuery } from '@/hooks/useStatsQuery';
import { usePasscodeStore } from '@/store/passcodeStore';
import { ownerApi } from '@/lib/api';
import { extendDailySetIfNeeded } from '@/lib/dailySet';

function DashboardContent() {
  const passcode = usePasscodeStore((s) => s.passcode);
  const setUser = usePasscodeStore((s) => s.setUser);
  const qc = useQueryClient();
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

  // Refresh owner profile once unlocked
  useEffect(() => {
    if (!passcode) return;
    ownerApi
      .getMe()
      .then((data) => setUser(data.user))
      .catch(() => {
        // 401 interceptor clears passcode
      });
  }, [passcode, setUser]);

  // Fill the saved daily set onto any newly upcoming days. Web only.
  useEffect(() => {
    if (!passcode) return;
    extendDailySetIfNeeded()
      .then((created) => {
        if (created > 0) {
          qc.invalidateQueries({ queryKey: ['tasks'] });
          qc.invalidateQueries({ queryKey: ['stats'] });
        }
      })
      .catch(() => {
        // Leave the set unmoved so the next visit can retry.
      });
  }, [passcode, qc]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <DashboardHeader
          date={selectedDate}
          onDateChange={setSelectedDate}
          completed={stats?.completedTasks ?? 0}
          total={stats?.totalTasks ?? 0}
        />

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

export default function DashboardPage() {
  return (
    <PasscodeGate>
      <DashboardContent />
    </PasscodeGate>
  );
}
