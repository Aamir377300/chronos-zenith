import { format } from 'date-fns';

export const todayString = (): string => format(new Date(), 'yyyy-MM-dd');

export const formatDisplayDate = (dateStr: string): string => {
  // e.g. "2026-05-01" → "Fri, 1 May"
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return format(d, 'EEE, d MMM');
};
