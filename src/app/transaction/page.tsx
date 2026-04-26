"use client";

import { useState } from "react";
import dayjs from "dayjs";
import {
  TransactionForm,
  TransactionList,
  MonthPicker,
  BottomNav,
  DataActions,
} from "@/components";
import { useTheme } from "@/hooks/useTheme";
import { useBudgetStore } from "@/store/budget";
import { formatCurrency } from "@/utils";
import { toMonthKey } from "@/types";

export default function TransactionPage() {
  const { mounted, darkMode, toggle } = useTheme();
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const { transactions, getBudgetForMonth } = useBudgetStore();

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
    <div
      className="min-h-screen pb-20"
      style={{ background: "var(--black)", color: "var(--text-primary)" }}
    >
      <div className="max-w-4xl mx-auto px-4 py-5 space-y-4">
        {/* Header */}
        <header className="flex justify-between items-center">
          <h1
            className="font-display text-3xl font-bold"
            style={{ color: "var(--text-display)" }}
          >
            Transaksi
          </h1>
          <div className="flex items-center gap-2">
            <MonthPicker
              selectedDate={selectedDate}
              onChange={setSelectedDate}
            />
            <button
              onClick={toggle}
              className="w-9 h-9 flex items-center justify-center rounded-lg"
              style={{
                border: "1px solid var(--border-visible)",
                color: "var(--text-secondary)",
                background: "transparent",
              }}
            >
              {darkMode ? "☀" : "☾"}
            </button>
          </div>
        </header>

        {/* Budget summary bar */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowBudgetModal(true)}
          className="w-full p-3 rounded-xl flex items-center justify-between"
          style={{
            background: "var(--surface)",
            border: "none",
            cursor: "pointer",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-[13px] font-bold"
              style={{
                background:
                  remaining < 0
                    ? "rgba(215,25,33,0.15)"
                    : "rgba(74,158,92,0.15)",
                color: remaining < 0 ? "var(--accent)" : "var(--success)",
              }}
            >
              {progress > 100 ? "!" : `${Math.min(progress, 100).toFixed(0)}%`}
            </div>
            <div className="text-left">
              <p
                className="text-[14px] font-semibold"
                style={{ color: "var(--text-display)" }}
              >
                {formatCurrency(remaining)}
              </p>
              <p
                className="text-[11px]"
                style={{ color: "var(--text-secondary)" }}
              >
                sisa dari {formatCurrency(budget)}
              </p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M11.7 3.3L12.7 4.3L5 12H4V11L11.7 3.3Z"
              stroke="var(--text-secondary)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Transaction Form */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "var(--surface)" }}
        >
          <TransactionForm />
        </div>

        {/* Transaction List */}
        <div
          className="p-4 rounded-xl"
          style={{ background: "var(--surface)" }}
        >
          <div className="flex justify-between items-center mb-3">
            <p
              className="text-[13px] font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Transaksi {dayjs(selectedDate).format("MMM YYYY")}
            </p>
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold"
              style={{
                background: "var(--border)",
                color: "var(--text-primary)",
              }}
            >
              {filteredTransactions.length}
            </span>
          </div>
          <TransactionList transactions={filteredTransactions} />
        </div>

        {/* Data Actions (Import/Export) */}
        <DataActions />
      </div>

      {showBudgetModal && (
        <BudgetModal
          monthKey={monthKey}
          onClose={() => setShowBudgetModal(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}

function BudgetModal({
  monthKey,
  onClose,
}: {
  monthKey: string;
  onClose: () => void;
}) {
  const {
    defaultBudget,
    setDefaultBudget,
    setMonthlyBudget,
    getBudgetForMonth,
  } = useBudgetStore();
  const currentBudget = getBudgetForMonth(monthKey);
  const [amount, setAmount] = useState(
    currentBudget > 0 ? currentBudget.toString() : "",
  );
  const [applyDefault, setApplyDefault] = useState(true);

  const handleSave = () => {
    const val = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (val > 0) {
      setMonthlyBudget(monthKey, val);
      if (applyDefault) {
        setDefaultBudget(val);
      }
      onClose();
    }
  };

  const displayMonth = dayjs(monthKey + "-01").format("MMMM YYYY");

  const formatInput = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    if (!num) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(num, 10));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-visible)",
        }}
      >
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <p
              className="text-[16px] font-semibold"
              style={{ color: "var(--text-display)" }}
            >
              Atur Budget
            </p>
            <p
              className="text-[12px]"
              style={{ color: "var(--text-secondary)" }}
            >
              {displayMonth}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[18px]"
            style={{
              border: "1px solid var(--border-visible)",
              color: "var(--text-secondary)",
              background: "transparent",
            }}
          >
            ×
          </button>
        </div>

        <div className="p-5 pb-8 sm:pb-5 space-y-5">
          <input
            type="text"
            inputMode="numeric"
            value={formatInput(amount)}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0"
            className="w-full h-20 px-4 text-[40px] font-bold font-mono text-center rounded-xl"
            style={{
              border: "1px solid var(--border-visible)",
              background: "var(--black)",
              color: "var(--accent)",
            }}
            autoFocus
          />

          <label className="flex items-center gap-3 cursor-pointer py-1">
            <div
              className="relative w-10 h-6 rounded-full flex-shrink-0 transition-colors"
              style={{
                background: applyDefault
                  ? "var(--accent)"
                  : "var(--border-visible)",
              }}
              onClick={() => setApplyDefault(!applyDefault)}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full transition-all"
                style={{
                  background: "white",
                  left: applyDefault ? "22px" : "4px",
                }}
              />
            </div>
            <span
              className="text-[13px]"
              style={{ color: "var(--text-primary)" }}
            >
              Terapkan default tiap bulan
            </span>
          </label>

          {defaultBudget > 0 && (
            <p
              className="text-[12px]"
              style={{ color: "var(--text-disabled)" }}
            >
              Default saat ini: {formatCurrency(defaultBudget)}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 h-11 text-[13px] rounded-lg"
              style={{
                border: "1px solid var(--border-visible)",
                color: "var(--text-secondary)",
                background: "transparent",
              }}
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="flex-1 h-11 text-[13px] font-bold rounded-lg"
              style={{
                background: "var(--accent)",
                color: "white",
                border: "none",
              }}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
