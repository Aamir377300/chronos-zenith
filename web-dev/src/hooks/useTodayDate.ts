import { useMemo } from 'react';
import { format } from 'date-fns';

/**
 * Returns today's date as YYYY-MM-DD string (memoized)
 */
export const useTodayDate = (): string => {
  return useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
};
