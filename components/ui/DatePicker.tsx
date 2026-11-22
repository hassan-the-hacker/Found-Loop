'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  RotateCcw
} from 'lucide-react';

interface DatePickerProps {
  id?: string;
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  maxDate?: string;
  minDate?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function parseYMD(ymd: string): { year: number; month: number; day: number } | null {
  if (!ymd) return null;
  const parts = ymd.split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return { year: parts[0], month: parts[1] - 1, day: parts[2] };
  }
  return null;
}

function formatDisplayDate(ymd: string): string {
  const parsed = parseYMD(ymd);
  if (!parsed) return 'Select date';
  const d = new Date(parsed.year, parsed.month, parsed.day);
  const now = new Date();

  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const formatted = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  if (isToday) {
    return `Today, ${formatted}`;
  }

  // Check yesterday
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  if (isYesterday) {
    return `Yesterday, ${formatted}`;
  }

  return formatted;
}

export default function DatePicker({
  id,
  value,
  onChange,
  maxDate,
  minDate,
  required = false,
  className = '',
  placeholder = 'Select date',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const selectedMonthRef = useRef<HTMLButtonElement | null>(null);
  const selectedYearRef = useRef<HTMLButtonElement | null>(null);

  const initialParsed = parseYMD(value) || {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    day: new Date().getDate(),
  };

  const [viewYear, setViewYear] = useState<number>(initialParsed.year);
  const [viewMonth, setViewMonth] = useState<number>(initialParsed.month);

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const list: number[] = [];
    const minYear = Math.min(current - 25, viewYear);
    for (let y = current; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [viewYear]);

  // Sync view when value changes from outside
  useEffect(() => {
    const p = parseYMD(value);
    if (p) {
      setViewYear(p.year);
      setViewMonth(p.month);
    }
  }, [value]);

  // Scroll selected items into view when dropdowns open
  useEffect(() => {
    if (isMonthOpen && selectedMonthRef.current) {
      selectedMonthRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isMonthOpen]);

  useEffect(() => {
    if (isYearOpen && selectedYearRef.current) {
      selectedYearRef.current.scrollIntoView({ block: 'center' });
    }
  }, [isYearOpen]);

  // Close month/year dropdowns when clicked outside
  useEffect(() => {
    function handleDropdownOutside(event: MouseEvent) {
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target as Node)) {
        setIsMonthOpen(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setIsYearOpen(false);
      }
    }
    if (isMonthOpen || isYearOpen) {
      document.addEventListener('mousedown', handleDropdownOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleDropdownOutside);
    };
  }, [isMonthOpen, isYearOpen]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsMonthOpen(false);
        setIsYearOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsMonthOpen(false);
        setIsYearOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const selectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const ymd = `${viewYear}-${mm}-${dd}`;
    onChange(ymd);
    setIsOpen(false);
  };

  const setShortcut = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const ymd = `${yyyy}-${mm}-${dd}`;
    onChange(ymd);
    setViewYear(yyyy);
    setViewMonth(d.getMonth());
    setIsOpen(false);
  };

  // Calendar cells computation
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sun
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const prevDays: Array<{ day: number; isCurrentMonth: boolean; ymd: string; disabled: boolean }> = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const ymd = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      prevDays.push({
        day: d,
        isCurrentMonth: false,
        ymd,
        disabled: (!!maxDate && ymd > maxDate) || (!!minDate && ymd < minDate),
      });
    }

    const currentDays: Array<{ day: number; isCurrentMonth: boolean; ymd: string; disabled: boolean }> = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      currentDays.push({
        day: d,
        isCurrentMonth: true,
        ymd,
        disabled: (!!maxDate && ymd > maxDate) || (!!minDate && ymd < minDate),
      });
    }

    const totalCells = prevDays.length + currentDays.length;
    const remaining = totalCells <= 35 ? 35 - totalCells : 42 - totalCells;

    const nextDays: Array<{ day: number; isCurrentMonth: boolean; ymd: string; disabled: boolean }> = [];
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const ymd = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      nextDays.push({
        day: d,
        isCurrentMonth: false,
        ymd,
        disabled: (!!maxDate && ymd > maxDate) || (!!minDate && ymd < minDate),
      });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [viewYear, viewMonth, maxDate, minDate]);

  const todayYMD = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Hidden input for HTML form compliance */}
      <input
        type="hidden"
        id={id}
        name={id}
        value={value}
        required={required}
      />

      {/* Modern Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`flex w-full items-center justify-between rounded-md border bg-surface px-3 py-2 text-sm text-left transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-accent/20 ${isOpen
          ? 'border-accent ring-2 ring-accent/20 shadow-sm'
          : 'border-[#D1D5DB] hover:border-text-secondary/60'
          }`}
      >
        <span className="flex items-center gap-2.5 truncate">
          <CalendarIcon className={`h-4 w-4 shrink-0 transition-colors ${isOpen ? 'text-accent' : 'text-text-muted'}`} />
          <span className={value ? 'text-text-primary font-medium truncate' : 'text-text-muted truncate'}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted bg-surface-subtle px-1.5 py-0.5 rounded border border-border-subtle shrink-0 ml-2">
          Pick
        </span>
      </button>

      {/* Modern Floating Calendar Popover */}
      {isOpen && (
        <div className="absolute z-50 left-0 mt-1 w-72 rounded-xl border border-border-subtle bg-surface p-3.5 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95 space-y-3">
          {/* Quick Shortcuts */}
          <div className="flex items-center gap-1.5 border-b border-border-subtle pb-2.5">
            <button
              type="button"
              onClick={() => setShortcut(0)}
              className="flex-1 rounded-md bg-surface-subtle border border-border-subtle py-1 px-2 text-[11px] font-semibold text-text-primary hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all text-center"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setShortcut(1)}
              className="flex-1 rounded-md bg-surface-subtle border border-border-subtle py-1 px-2 text-[11px] font-medium text-text-secondary hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all text-center"
            >
              Yesterday
            </button>
            <button
              type="button"
              onClick={() => setShortcut(3)}
              className="flex-1 rounded-md bg-surface-subtle border border-border-subtle py-1 px-2 text-[11px] font-medium text-text-secondary hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all text-center"
            >
              3 Days Ago
            </button>
          </div>

          {/* Month / Year Navigation */}
          <div className="flex items-center justify-between gap-1.5 px-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-[#F3F4F6] hover:text-text-primary transition-colors shrink-0"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5 flex-1 justify-center">
              {/* Modern Month Selector */}
              <div className="relative" ref={monthDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsMonthOpen(!isMonthOpen);
                    setIsYearOpen(false);
                  }}
                  className={`flex items-center gap-1 rounded-md border py-1 pl-2.5 pr-2 text-xs font-semibold transition-all ${
                    isMonthOpen
                      ? 'border-accent bg-accent/10 text-accent ring-2 ring-accent/20'
                      : 'border-border-subtle bg-surface-subtle/70 text-text-primary hover:border-accent hover:bg-surface'
                  }`}
                  aria-label="Select month"
                >
                  <span>{MONTH_NAMES[viewMonth]}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isMonthOpen ? 'rotate-180 text-accent' : 'text-text-muted'}`} />
                </button>

                {isMonthOpen && (
                  <div className="absolute left-0 top-full mt-1.5 z-30 w-44 max-h-56 overflow-y-auto rounded-lg border border-border-subtle bg-surface p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle mb-1">
                      Select Month
                    </div>
                    <div className="space-y-0.5">
                      {MONTH_NAMES.map((m, idx) => {
                        const isSelected = idx === viewMonth;
                        return (
                          <button
                            key={m}
                            ref={isSelected ? selectedMonthRef : null}
                            type="button"
                            onClick={() => {
                              setViewMonth(idx);
                              setIsMonthOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                              isSelected
                                ? 'bg-accent text-white font-semibold shadow-xs'
                                : 'text-text-primary hover:bg-[#F3F4F6] hover:text-accent font-medium'
                            }`}
                          >
                            <span>{m}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Modern Year Selector */}
              <div className="relative" ref={yearDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsYearOpen(!isYearOpen);
                    setIsMonthOpen(false);
                  }}
                  className={`flex items-center gap-1 rounded-md border py-1 pl-2.5 pr-2 text-xs font-semibold transition-all ${
                    isYearOpen
                      ? 'border-accent bg-accent/10 text-accent ring-2 ring-accent/20'
                      : 'border-border-subtle bg-surface-subtle/70 text-text-primary hover:border-accent hover:bg-surface'
                  }`}
                  aria-label="Select year"
                >
                  <span>{viewYear}</span>
                  <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isYearOpen ? 'rotate-180 text-accent' : 'text-text-muted'}`} />
                </button>

                {isYearOpen && (
                  <div className="absolute right-0 top-full mt-1.5 z-30 w-32 max-h-56 overflow-y-auto rounded-lg border border-border-subtle bg-surface p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle mb-1">
                      Select Year
                    </div>
                    <div className="space-y-0.5">
                      {yearOptions.map((y) => {
                        const isSelected = y === viewYear;
                        return (
                          <button
                            key={y}
                            ref={isSelected ? selectedYearRef : null}
                            type="button"
                            onClick={() => {
                              setViewYear(y);
                              setIsYearOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors ${
                              isSelected
                                ? 'bg-accent text-white font-semibold shadow-xs'
                                : 'text-text-primary hover:bg-[#F3F4F6] hover:text-accent font-medium'
                            }`}
                          >
                            <span>{y}</span>
                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-[#F3F4F6] hover:text-text-primary transition-colors shrink-0"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAYS_OF_WEEK.map((day) => (
              <span
                key={day}
                className="text-[10px] font-bold uppercase tracking-wider text-text-muted py-1"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              const isSelected = cell.ymd === value;
              const isToday = cell.ymd === todayYMD;

              if (cell.disabled) {
                return (
                  <span
                    key={idx}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-xs text-text-muted/30 cursor-not-allowed select-none"
                  >
                    {cell.day}
                  </span>
                );
              }

              if (!cell.isCurrentMonth) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onChange(cell.ymd);
                      setIsOpen(false);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-xs text-text-muted/40 hover:bg-[#F3F4F6] hover:text-text-secondary transition-colors"
                  >
                    {cell.day}
                  </button>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDay(cell.day)}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-xs transition-all relative ${isSelected
                    ? 'bg-accent text-white font-bold shadow-sm'
                    : isToday
                      ? 'font-bold text-accent border border-accent/40 bg-accent/5 hover:bg-accent/15'
                      : 'text-text-primary font-medium hover:bg-[#F3F4F6] hover:text-text-primary'
                    }`}
                >
                  {cell.day}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

