'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { AddTaskModal } from './AddTaskModal';
import { CalendarStrip } from './CalendarStrip';

interface Props {
  date: string; // YYYY-MM-DD
  onDateChange: (date: string) => void;
}

function RatingBadge({ earned, possible }: { earned: number; possible: number }) {
  const pct = possible > 0 ? Math.round((earned / possible) * 100) : 0;
  const color =
    pct >= 80 ? 'border-emerald-500 text-emerald-600' :
    pct >= 50 ? 'border-amber-400 text-amber-500' :
    'border-red-400 text-red-500';

  return (
    <div
      className={`w-13 h-13 w-[52px] h-[52px] rounded-full border-2 bg-white flex flex-col items-center justify-center shadow-sm ${color}`}
      title={`Rating: ${earned} pts earned / ${possible} pts possible`}
    >
      <span className="text-[13px] font-bold leading-4">{earned}</span>
      <span className="text-[10px] font-semibold leading-3 opacity-75">/{possible}</span>
    </div>
  );
}

export function DashboardHeader({ date, onDateChange }: Props) {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Timeline</h2>
          {user && <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>}
        </div>

        <div className="flex items-center gap-2">
          <RatingBadge
            earned={user?.totalRating ?? 0}
            possible={user?.totalTasksAssigned ?? 0}
          />
          <button
            onClick={() => setShowModal(true)}
            aria-label="Add task"
            className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-light transition-colors shadow-sm"
          >
            +
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="mt-6 mb-2">
        <CalendarStrip selectedDate={date} onSelectDate={onDateChange} />
      </div>

      {showModal && <AddTaskModal date={date} onClose={() => setShowModal(false)} />}
    </>
  );
}
