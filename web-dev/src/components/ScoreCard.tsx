'use client';

import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

interface Props {
  achievedScore: number;
  totalScore: number;
  streak?: string;
}

export function ScoreCard({ achievedScore, totalScore, streak }: Props) {
  const user = useAuthStore((s) => s.user);
  const percentage = totalScore > 0 ? Math.min((achievedScore / totalScore) * 100, 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Today's Score</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-gray-900">{achievedScore}</span>
            <span className="text-lg text-gray-400">/ {totalScore}</span>
          </div>
        </div>

        {/* Streak badge */}
        <div className="text-right">
          <div
            className={clsx(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
              (user?.currentStreak ?? 0) > 0
                ? 'bg-orange-50 text-orange-600'
                : 'bg-gray-100 text-gray-400'
            )}
          >
            <span>🔥</span>
            <span>{user?.currentStreak ?? 0} day streak</span>
          </div>
          {streak && (
            <p className="text-xs text-green-600 font-medium mt-1">🔥 Streak Bonus!</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2 text-right">{Math.round(percentage)}% complete</p>
    </div>
  );
}
