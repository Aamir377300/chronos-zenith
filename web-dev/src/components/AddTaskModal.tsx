'use client';

import { useState } from 'react';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasksQuery';
import { format } from 'date-fns';
import { type Task } from '@/lib/api';

interface Props {
  date: string;
  onClose: () => void;
  editingTask?: Task | null;
}

export function AddTaskModal({ date, onClose, editingTask }: Props) {
  const [title, setTitle] = useState(editingTask?.title || '');
  const [schedule, setSchedule] = useState(editingTask?.date || date);
  const { mutate: createTask, isPending: isCreating } = useCreateTask(date);
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask();

  const isPending = isCreating || isUpdating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(
        { id: editingTask._id, title: title.trim(), date: schedule },
        { onSuccess: onClose }
      );
    } else {
      createTask(
        { title: title.trim(), date: schedule },
        { onSuccess: onClose }
      );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingTask ? 'Edit Task' : 'Add Task'}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
              placeholder="What do you need to do?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
            <input
              type="date"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {isPending ? 'Saving...' : editingTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
