"use client";

import { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";

interface MonthPickerProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export function MonthPicker({ selectedDate, onChange }: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(dayjs(selectedDate).year());
  const containerRef = useRef<HTMLDivElement>(null);

  const today = dayjs();
  const selectedMonth = dayjs(selectedDate);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  const handleSelectMonth = (monthIndex: number) => {
    const selected = dayjs().year(viewYear).month(monthIndex).startOf("month");
    onChange(selected.toDate());
    setOpen(false);
  };

  const handleThisMonth = () => {
    onChange(dayjs().startOf("month").toDate());
    setViewYear(dayjs().year());
    setOpen(false);
  };

  const displayText = selectedMonth.format("MMM YYYY");

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          setViewYear(selectedMonth.year());
        }}
        className="h-10 px-3 text-[13px] rounded-lg flex items-center gap-2"
        style={{
          border: "1px solid var(--border-visible)",
          color: "var(--text-primary)",
          background: "var(--surface)",
        }}
      >
        <span>{displayText}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }}
        >
          <path
            d="M1.5 3.5L5 7L8.5 3.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-64 rounded-xl overflow-hidden"
          style={{
            border: "1px solid var(--border-visible)",
            background: "var(--surface)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Year navigation */}
          <div
            className="flex items-center justify-between px-3 py-2.5"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <button
              onClick={() => setViewYear(viewYear - 1)}
              className="w-7 h-7 flex items-center justify-center rounded text-[16px]"
              style={{
                color: "var(--text-secondary)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              ‹
            </button>
            <span
              className="text-[14px] font-semibold"
              style={{ color: "var(--text-display)" }}
            >
              {viewYear}
            </span>
            <button
              onClick={() =>
                viewYear < today.year() && setViewYear(viewYear + 1)
              }
              className="w-7 h-7 flex items-center justify-center rounded text-[16px]"
              style={{
                color:
                  viewYear >= today.year()
                    ? "var(--text-disabled)"
                    : "var(--text-secondary)",
                background: "none",
                border: "none",
                cursor: viewYear >= today.year() ? "not-allowed" : "pointer",
              }}
            >
              ›
            </button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-1 p-2.5">
            {months.map((m, i) => {
              const isFuture =
                viewYear > today.year() ||
                (viewYear === today.year() && i > today.month());
              const isSelected =
                viewYear === selectedMonth.year() &&
                i === selectedMonth.month();
              const isCurrent =
                viewYear === today.year() && i === today.month();

              return (
                <button
                  key={m}
                  onClick={() => !isFuture && handleSelectMonth(i)}
                  disabled={isFuture}
                  className="h-9 rounded-lg text-[13px] transition-colors"
                  style={{
                    background: isSelected ? "var(--accent)" : "transparent",
                    color: isSelected
                      ? "white"
                      : isFuture
                        ? "var(--text-disabled)"
                        : isCurrent
                          ? "var(--accent)"
                          : "var(--text-primary)",
                    border:
                      isCurrent && !isSelected
                        ? "1px solid var(--accent)"
                        : "1px solid transparent",
                    cursor: isFuture ? "not-allowed" : "pointer",
                    fontWeight: isSelected || isCurrent ? 600 : 400,
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-1.5 px-2.5 pb-2.5">
            <button
              onClick={() => setOpen(false)}
              className="h-8 px-3 text-[11px] font-mono rounded-lg"
              style={{
                border: "1px solid var(--border-visible)",
                color: "var(--text-secondary)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Tutup
            </button>
            <button
              onClick={handleThisMonth}
              className="flex-1 h-8 text-[11px] font-mono font-medium rounded-lg"
              style={{
                background: "var(--accent)",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Bulan Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface DayPickerProps {
  date: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function DayPicker({
  date,
  onChange,
  className,
  style,
}: DayPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewDate, setViewDate] = useState(dayjs(date));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (open) {
      setViewDate(dayjs(date));
    }
  }, [open, date]);

  const selectedDay = dayjs(date);
  const startOfMonth = viewDate.startOf("month");
  const daysInMonth = viewDate.daysInMonth();
  const startDay = startOfMonth.day(); // 0 is Sunday

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setViewDate(viewDate.subtract(1, "month"));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    setViewDate(viewDate.add(1, "month"));
  };

  const handleSelectDay = (day: number) => {
    const newDate = viewDate.date(day).format("YYYY-MM-DD");
    onChange(newDate);
    setOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className || ""}`}
      style={style}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-full px-3 flex items-center justify-between gap-2 rounded-lg cursor-pointer"
        style={{
          border: "1px solid var(--border-visible)",
          color: "var(--text-primary)",
          background: "var(--black)",
        }}
      >
        <span className="truncate text-[13px]">
          {selectedDay.format("DD MMM YYYY")}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }}
        >
          <path
            d="M1.5 3.5L5 7L8.5 3.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1 w-[260px] rounded-xl overflow-hidden"
          style={{
            border: "1px solid var(--border-visible)",
            background: "var(--black)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            // bottom: "100%", // Open upwards to avoid clipping, or adjust as needed. Let's do top: 100%
            top: "calc(100% + 4px)",
            bottom: "auto",
          }}
        >
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <button
              onClick={handlePrevMonth}
              className="w-7 h-7 flex items-center justify-center rounded text-[16px] hover:bg-white/5 transition-colors"
              style={{
                color: "var(--text-secondary)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              ‹
            </button>
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--text-display)" }}
            >
              {viewDate.format("MMMM YYYY")}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-7 h-7 flex items-center justify-center rounded text-[16px] hover:bg-white/5 transition-colors"
              style={{
                color: "var(--text-secondary)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              ›
            </button>
          </div>

          <div className="p-2">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["M", "S", "S", "R", "K", "J", "S"].map((d, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] font-bold"
                  style={{ color: "var(--text-disabled)" }}
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((d, i) => {
                if (d === null) return <div key={i} />;
                const isSelected = selectedDay.isSame(viewDate.date(d), "day");
                const isToday = dayjs().isSame(viewDate.date(d), "day");

                return (
                  <button
                    key={i}
                    onClick={() => handleSelectDay(d)}
                    className="h-8 rounded flex items-center justify-center text-[12px] transition-colors"
                    style={{
                      background: isSelected ? "var(--accent)" : "transparent",
                      color: isSelected
                        ? "white"
                        : isToday
                          ? "var(--accent)"
                          : "var(--text-primary)",
                      border:
                        isToday && !isSelected
                          ? "1px solid var(--accent)"
                          : "none",
                      fontWeight: isSelected || isToday ? 600 : 400,
                      cursor: "pointer",
                    }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 pb-2.5">
            <button
              onClick={() => setOpen(false)}
              className="h-8 px-3 text-[11px] font-mono rounded-lg"
              style={{
                border: "1px solid var(--border-visible)",
                color: "var(--text-secondary)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Tutup
            </button>
            <button
              onClick={() => {
                setViewDate(dayjs());
                onChange(dayjs().format("YYYY-MM-DD"));
                setOpen(false);
              }}
              className="flex-1 h-8 text-[11px] font-mono font-medium rounded-lg"
              style={{
                background: "var(--accent)",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Hari Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
