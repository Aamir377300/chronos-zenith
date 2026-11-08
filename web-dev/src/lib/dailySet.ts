import { addDays, format, parseISO } from 'date-fns';
import { tasksApi } from '@/lib/api';

const STORAGE_KEY = 'cz-daily-set';
/** Today plus the next 13 days — matches the forward calendar window. */
export const SET_DAY_COUNT = 14;

export interface DailySet {
  titles: string[];
  /** Last date (YYYY-MM-DD) this set has already been filled through. */
  appliedThrough: string | null;
}

export function todayKey() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function addDaysKey(from: string, days: number) {
  return format(addDays(parseISO(from), days), 'yyyy-MM-dd');
}

export function loadDailySet(): DailySet {
  if (typeof window === 'undefined') return { titles: [], appliedThrough: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { titles: [], appliedThrough: null };
    const parsed = JSON.parse(raw) as DailySet;
    return {
      titles: Array.isArray(parsed.titles) ? parsed.titles.filter((t) => typeof t === 'string' && t.trim()) : [],
      appliedThrough: typeof parsed.appliedThrough === 'string' ? parsed.appliedThrough : null,
    };
  } catch {
    return { titles: [], appliedThrough: null };
  }
}

export function saveDailySet(set: DailySet) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(set));
}

function datesFrom(start: string, end: string) {
  const dates: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    dates.push(cursor);
    cursor = addDaysKey(cursor, 1);
  }
  return dates;
}

/**
 * Fill the set onto a list of dates. Titles that already exist on a date are skipped,
 * so deleting one day's copy is not undone until that date is sent again.
 */
export async function fillDailySet(titles: string[], dates: string[]) {
  const clean = Array.from(new Set(titles.map((t) => t.trim()).filter(Boolean)));
  if (!clean.length || !dates.length) return 0;
  return tasksApi.createSet({ titles: clean, dates });
}

/**
 * On later visits, only the newly upcoming days are filled.
 * Days already covered stay as the user left them.
 */
export async function extendDailySetIfNeeded() {
  const set = loadDailySet();
  if (!set.titles.length) return 0;

  const today = todayKey();
  const windowEnd = addDaysKey(today, SET_DAY_COUNT - 1);
  if (set.appliedThrough && set.appliedThrough >= windowEnd) return 0;

  const start =
    set.appliedThrough && set.appliedThrough >= today
      ? addDaysKey(set.appliedThrough, 1)
      : today;
  if (start > windowEnd) return 0;

  const created = await fillDailySet(set.titles, datesFrom(start, windowEnd));
  saveDailySet({ ...set, appliedThrough: windowEnd });
  return created;
}
