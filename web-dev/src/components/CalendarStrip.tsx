'use client';

import { format, addDays, subDays, startOfDay, isSameDay, parseISO } from 'date-fns';
import clsx from 'clsx';
import { useRef, useEffect } from 'react';

interface Props {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
}

export function CalendarStrip({ selectedDate, onSelectDate }: Props) {
  // Parse the selected string "YYYY-MM-DD" safely
  const selected = parseISO(selectedDate);
  const today = startOfDay(new Date());
  
  // Generate an array of dates: 14 days before and 14 days after the selected date
  const dates = Array.from({ length: 29 }).map((_, i) => addDays(subDays(selected, 14), i));
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      // Center the selected item initially
      const container = scrollRef.current;
      const selectedElement = container.querySelector('[data-selected="true"]');
      if (selectedElement) {
        selectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedDate]);

  return (
    <div 
      ref={scrollRef}
      className="flex overflow-x-auto gap-3 py-2 scroll-smooth"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {dates.map((date) => {
        const isSelected = isSameDay(date, selected);
        const isToday = isSameDay(date, today);
        const dateStr = format(date, 'yyyy-MM-dd');
        return (
          <button
            key={dateStr}
            data-selected={isSelected}
            onClick={() => onSelectDate(dateStr)}
            className={clsx(
              'relative flex flex-col items-center justify-center w-[4rem] h-[4.5rem] rounded-2xl flex-shrink-0 transition-all duration-200',
              isSelected 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105' 
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
            )}
          >
            <span className={clsx('text-[11px] font-semibold uppercase tracking-wider', isSelected ? 'text-blue-100' : 'text-gray-400')}>
              {format(date, 'EEE')}
            </span>
            <span className={clsx('text-xl font-bold mt-1 tracking-tight', isSelected ? 'text-white' : 'text-gray-900')}>
              {format(date, 'd')}
            </span>
            {isToday && !isSelected && (
              <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-blue-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
