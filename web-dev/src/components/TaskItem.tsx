'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { type Task } from '@/lib/api';
import { useToggleTask, useDeleteTask } from '@/hooks/useTasksQuery';
import { useState } from 'react';
import clsx from 'clsx';
import { AddTaskModal } from './AddTaskModal';

interface Props {
  task: Task;
  date: string;
  isLast: boolean;
  showTime?: boolean;
}

export function TaskItem({ task, date, isLast, showTime = false }: Props) {
  const { mutate: toggle } = useToggleTask(date);
  const { mutate: deleteTask } = useDeleteTask(date);
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="relative flex items-start gap-3 py-2 pl-2 pr-2 group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Timeline dot / checkbox */}
      <button
        onClick={() => toggle(task._id)}
        aria-label={task.isCompleted ? 'Mark incomplete' : 'Mark complete'}
        className="relative z-10 flex-shrink-0"
      >
        <motion.div
          animate={task.isCompleted ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 0.25 }}
          className={clsx(
            'w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors',
            task.isCompleted
              ? 'bg-blue-500 border-blue-500'
              : 'bg-white border-gray-300 hover:border-blue-400'
          )}
        >
          <AnimatePresence>
            {task.isCompleted && (
              <motion.svg
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <p
          className={clsx(
            'text-sm font-medium leading-snug transition-colors',
            task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
          )}
        >
          {task.title}
        </p>
        {showTime && task.time && (
          <p className="text-xs text-gray-400 mt-0.5">{task.time}</p>
        )}
      </div>

      {/* Actions (visible on hover) */}
      <AnimatePresence>
        {showActions && !task.isCompleted && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditing(true)}
            aria-label="Edit task"
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </motion.button>
        )}
        {showActions && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => deleteTask(task._id)}
            aria-label="Delete task"
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors rounded-full hover:bg-red-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {isEditing && (
        <AddTaskModal
          date={date}
          onClose={() => setIsEditing(false)}
          editingTask={task}
        />
      )}
    </motion.li>
  );
}
