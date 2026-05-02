'use client';

import { useMemo } from 'react';
import { type Task } from '@/lib/api';
import { TaskItem } from './TaskItem';
import { format } from 'date-fns';

interface Props {
  tasks: Task[];
  selectedDate: string;
}

export function Timeline({ tasks, selectedDate }: Props) {
  // Get actual today's date
  const actualToday = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  // Filter tasks for ONLY the selected date
  const tasksForSelectedDate = useMemo(() => {
    return tasks.filter(task => task.date === selectedDate);
  }, [tasks, selectedDate]);

  const isToday = selectedDate === actualToday;

  if (tasksForSelectedDate.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <p className="text-gray-500 text-sm">
          No tasks for {isToday ? 'today' : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      </div>
    );
  }

  return (
    <div className="relative pb-8">
      {/* Date header */}
      <div className="mb-4">
        {isToday ? (
          <h2 className="text-lg font-bold text-gray-900">
            Today • {new Date(selectedDate).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
        ) : (
          <h2 className="text-lg font-bold text-gray-900">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
        )}
      </div>

      {/* Continuous timeline line */}
      <div className="absolute left-[27px] top-16 bottom-0 w-0.5 bg-gray-200" aria-hidden="true" />
      
      {/* Tasks for selected date */}
      <ul className="space-y-0 relative" role="list" aria-label="Task timeline">
        {tasksForSelectedDate.map((task, index) => (
          <TaskItem
            key={task._id}
            task={task}
            date={selectedDate}
            isLast={index === tasksForSelectedDate.length - 1}
            showTime={true}
          />
        ))}
      </ul>
    </div>
  );
}
