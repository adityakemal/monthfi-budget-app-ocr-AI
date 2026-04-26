'use client';

import { useTheme } from '@/hooks/useTheme';
import { MonthPicker } from './DatePicker';

interface AppHeaderProps {
  title: string;
  isShowTheme?: boolean;
  isShowDatepicker?: boolean;
  selectedDate?: Date;
  onMonthChange?: (date: Date) => void;
}

export function AppHeader({
  title,
  isShowTheme = true,
  isShowDatepicker = true,
  selectedDate,
  onMonthChange,
}: AppHeaderProps) {
  const { darkMode, toggle } = useTheme();

  return (
    <header className="flex justify-between items-center">
      <h1
        className="font-display text-2xl md:text-4xl font-bold"
        style={{ color: 'var(--text-display)' }}
      >
        {title}
      </h1>
      <div className="flex items-center gap-2">
        {isShowDatepicker && selectedDate && onMonthChange && (
          <MonthPicker selectedDate={selectedDate} onChange={onMonthChange} />
        )}
        {isShowTheme && (
          <button
            onClick={toggle}
            className="w-9 h-9 flex items-center justify-center rounded-lg"
            style={{
              border: '1px solid var(--border-visible)',
              color: 'var(--text-secondary)',
              background: 'transparent',
            }}
          >
            {darkMode ? '☀' : '☾'}
          </button>
        )}
      </div>
    </header>
  );
}
