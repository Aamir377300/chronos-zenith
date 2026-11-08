'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fillDailySet, loadDailySet, saveDailySet, SET_DAY_COUNT, todayKey, addDaysKey } from '@/lib/dailySet';

interface Props {
  onClose: () => void;
}

function datesAhead(count: number) {
  const today = todayKey();
  const dates = [today];
  for (let i = 1; i < count; i += 1) dates.push(addDaysKey(today, i));
  return dates;
}

export function DailySetModal({ onClose }: Props) {
  const qc = useQueryClient();
  const [titles, setTitles] = useState<string[]>(() => loadDailySet().titles);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const addTitle = () => {
    const next = draft.trim();
    if (!next) return;
    if (titles.some((t) => t.toLowerCase() === next.toLowerCase())) {
      setError('That task is already in the set');
      return;
    }
    if (titles.length >= 20) {
      setError('A set can hold up to 20 tasks');
      return;
    }
    setTitles((prev) => [...prev, next]);
    setDraft('');
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const dates = datesAhead(SET_DAY_COUNT);
      const created = titles.length ? await fillDailySet(titles, dates) : 0;
      saveDailySet({
        titles,
        appliedThrough: titles.length ? dates[dates.length - 1] : null,
      });
      if (created > 0) {
        await qc.invalidateQueries({ queryKey: ['tasks'] });
        await qc.invalidateQueries({ queryKey: ['stats'] });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the set');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl max-h-[85vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900">Daily set</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">
          These tasks are added to today and the next {SET_DAY_COUNT - 1} days. Each new day is filled when you open the web app.
        </p>

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            addTitle();
          }}
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Task in the set"
            maxLength={200}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg"
          >
            Add
          </button>
        </form>

        <ul className="mt-4 space-y-2">
          {titles.length === 0 && (
            <li className="text-sm text-gray-400">No tasks in this set yet.</li>
          )}
          {titles.map((title) => (
            <li key={title} className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-800">{title}</span>
              <button
                type="button"
                onClick={() => setTitles((prev) => prev.filter((t) => t !== title))}
                className="text-xs text-gray-400 hover:text-red-500"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        <div className="flex gap-3 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg"
          >
            {saving ? 'Saving...' : 'Save set'}
          </button>
        </div>
      </div>
    </div>
  );
}
