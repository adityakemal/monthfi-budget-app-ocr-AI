"use client";

import { useState, useMemo } from "react";
import dayjs from "dayjs";
import {
  CategoryChart,
  WeeklyChart,
  SavingsChart,
  MonthPicker,
  BottomNav,
  AppHeader,
} from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { useBudgetStore } from "@/store/budget";
import { formatCurrency } from "@/utils";
import { toMonthKey } from "@/types";

export default function Home() {
  const { mounted, darkMode, toggle } = useTheme();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const {
    defaultBudget,
    transactions,
    categories,
    getBudgetForMonth,
    monthlyBudgets,
  } = useBudgetStore();

  const monthKey = toMonthKey(selectedDate);
  const budget = getBudgetForMonth(monthKey);

  const start = dayjs(selectedDate).startOf("month").toDate();
  const end = dayjs(selectedDate).endOf("month").toDate();
  const filteredTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= start && d <= end;
  });

  const totalSpent = filteredTransactions.reduce(
    (sum, t) => sum + t.nominal,
    0,
  );
  const remaining = budget - totalSpent;
  const progress = budget > 0 ? (totalSpent / budget) * 100 : 0;

  // Stats
  const daysInMonth = dayjs(selectedDate).daysInMonth();
  const daysPassed = dayjs().isSame(dayjs(selectedDate), "month")
    ? dayjs().date()
    : daysInMonth;
  const dailyAvg = daysPassed > 0 ? totalSpent / daysPassed : 0;
  const projectedSpend = dailyAvg * daysInMonth;
  const transactionCount = filteredTransactions.length;

  // Top category
  const catTotals: Record<string, number> = {};
  filteredTransactions.forEach((t) => {
    catTotals[t.kategori] = (catTotals[t.kategori] || 0) + t.nominal;
  });
  const topCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];

  // Savings trend (last 6 months)
  const savingsData = useMemo(() => {
    const months: { month: string; budget: number; spent: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = dayjs(selectedDate).subtract(i, "month");
      const key = toMonthKey(m.toDate());
      const mBudget = getBudgetForMonth(key);
      const mSpent = transactions
        .filter((t) => {
          const d = dayjs(t.date);
          return d.isSame(m, "month");
        })
        .reduce((s, t) => s + t.nominal, 0);

      if (mBudget > 0 || mSpent > 0) {
        months.push({ month: key, budget: mBudget, spent: mSpent });
      }
    }
    return months;
  }, [
    selectedDate,
    transactions,
    getBudgetForMonth,
    monthlyBudgets,
    defaultBudget,
  ]);

  if (!mounted) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ background: "var(--black)" }}
      >
        <div
          className="w-5 h-5 rounded-full"
          style={{
            border: "2px solid var(--accent)",
            borderTopColor: "transparent",
            animation: "spin 0.6s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <main className="flex-1 pb-20 px-4 py-5 space-y-4 text-[var(--text-primary)]">
      {/* Header */}
      <AppHeader
        title="sesaKu"
        selectedDate={selectedDate}
        onMonthChange={setSelectedDate}
      />

      {/* Budget Overview */}
      <div className="p-4 rounded-xl " style={{ background: "var(--surface)" }}>
        <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
          <div className="">
            <p
              className="text-[12px] font-medium mb-0.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Sisa Budget
            </p>
            <p
              className="text-2xl md:text-4xl font-bold font-display leading-none whitespace-nowrap"
              style={{
                color: remaining < 0 ? "var(--accent)" : "var(--text-display)",
              }}
            >
              {formatCurrency(remaining)}
            </p>
          </div>
          <div className=" sm:justify-end justify-start">
            <p
              className="text-[12px] whitespace-nowrap"
              style={{ color: "var(--text-secondary)" }}
            >
              {formatCurrency(totalSpent)} / {formatCurrency(budget)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 items-center">
          <div
            className="h-2 w-full rounded-full overflow-hidden"
            style={{ background: "var(--border)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(progress, 100)}%`,
                background: getStatusColor(progress),
              }}
            />
          </div>
          <p
            className="text-[14px] font-mono font-bold whitespace-nowrap"
            style={{ color: getStatusColor(progress) }}
          >
            {progress > 100 ? "Over " : ""}
            {Math.min(progress, 999).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Transaksi" value={String(transactionCount)} />
        <StatCard
          label="Rata-rata/hari"
          value={formatCurrency(dailyAvg)}
          small
        />
        <StatCard
          label="Proyeksi"
          value={formatCurrency(projectedSpend)}
          small
          alert={budget > 0 && projectedSpend > budget}
        />
      </div>

      {/* Top Category */}
      {topCategory && (
        <div
          className="p-4 rounded-xl flex items-center justify-between"
          style={{ background: "var(--surface)" }}
        >
          <div>
            <p
              className="text-[12px] mb-0.5"
              style={{ color: "var(--text-secondary)" }}
            >
              Pengeluaran terbesar
            </p>
            <p
              className="text-[16px] font-semibold"
              style={{ color: "var(--text-display)" }}
            >
              {topCategory[0]}
            </p>
          </div>
          <p
            className="text-[16px] font-mono font-bold"
            style={{ color: "var(--accent)" }}
          >
            {formatCurrency(topCategory[1])}
          </p>
        </div>
      )}

      {/* Charts */}
      {filteredTransactions.length > 0 && (
        <>
          <div
            className="p-4 rounded-xl"
            style={{ background: "var(--surface)" }}
          >
            <p
              className="text-[13px] font-medium mb-3"
              style={{ color: "var(--text-secondary)" }}
            >
              Kategori
            </p>
            <CategoryChart
              transactions={filteredTransactions}
              categories={categories}
            />
          </div>

          <div
            className="p-4 rounded-xl"
            style={{ background: "var(--surface)" }}
          >
            <WeeklyChart
              transactions={filteredTransactions}
              selectedMonth={selectedDate}
            />
          </div>
        </>
      )}

      {/* Savings Trend */}
      <div className="p-4 rounded-xl" style={{ background: "var(--surface)" }}>
        <p
          className="text-[13px] font-medium mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          Tren Sisa Budget
        </p>
        <SavingsChart monthlyData={savingsData} />
      </div>
      <BottomNav />
    </main>
  );
}

function StatCard({
  label,
  value,
  small,
  alert,
}: {
  label: string;
  value: string;
  small?: boolean;
  alert?: boolean;
}) {
  return (
    <div className="p-3 rounded-xl" style={{ background: "var(--surface)" }}>
      <p
        className="text-[11px] mb-1"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </p>
      <p
        className={`font-semibold leading-tight ${small ? "text-[13px] font-mono" : "text-[20px] font-display"}`}
        style={{ color: alert ? "var(--accent)" : "var(--text-display)" }}
      >
        {value}
      </p>
    </div>
  );
}

function getStatusColor(progress: number) {
  if (progress > 100) return "var(--accent)";
  if (progress > 80) return "var(--warning)";
  return "var(--success)";
}
