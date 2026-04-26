"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
import dayjs from "dayjs";
import { useBudgetStore } from "@/store/budget";
import { DayPicker } from "./DatePicker";

function formatNumber(value: string): string {
  const num = value.replace(/[^0-9]/g, "");
  if (!num) return "";
  return new Intl.NumberFormat("id-ID").format(parseInt(num, 10));
}

export function TransactionForm() {
  const { categories, addCategory, addTransaction, transactions } =
    useBudgetStore();
  const [nominal, setNominal] = useState("");
  const [name, setName] = useState("");
  const [kategori, setKategori] = useState<string>(categories[0] || "");
  const [keterangan, setKeterangan] = useState("");
  const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fuse.js — build from recent 2 months of transaction names
  const fuse = useMemo(() => {
    const cutoff = dayjs().subtract(2, "month").toISOString();
    const recentNames = [
      ...new Set(
        transactions
          .filter((t) => t.date >= cutoff && t.name)
          .map((t) => t.name),
      ),
    ];
    return new Fuse(
      recentNames.map((n) => ({ name: n })),
      {
        keys: ["name"],
        threshold: 0.4,
      },
    );
  }, [transactions]);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    setNominal(formatNumber(raw));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (val.trim().length >= 2) {
      const results = fuse
        .search(val)
        .slice(0, 5)
        .map((r) => r.item.name);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setName(suggestion);
    setShowSuggestions(false);
  };

  const handleAddTransaction = () => {
    const val = parseInt(nominal.replace(/[^0-9]/g, ""), 10);
    if (val > 0 && kategori && name.trim()) {
      addTransaction({
        name: name.trim(),
        nominal: val,
        kategori,
        keterangan,
        date: dayjs(date).toISOString(),
      });
      setNominal("");
      setName("");
      setKeterangan("");
      setDate(dayjs().format("YYYY-MM-DD"));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTransaction();
    }
  };

  const handleSelectCategory = (cat: string) => {
    setKategori(cat);
    setDropdownOpen(false);
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    addCategory(trimmed);
    setKategori(trimmed);
    setNewCategory("");
    setDropdownOpen(false);
  };

  const handleNewCatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync kategori if categories change
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(kategori)) {
      setKategori(categories[0]);
    }
  }, [categories, kategori]);

  const canSubmit = nominal && kategori && name.trim();

  return (
    <div className="flex flex-col gap-2">
      {/* Row 1: Name + Nominal */}
      <div className="grid grid-cols-2 gap-2">
        <div className="w-full" ref={suggestionsRef}>
          <input
            type="text"
            placeholder="Nama (ex: Popok)"
            value={name}
            onChange={handleNameChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0 && name.trim().length >= 2)
                setShowSuggestions(true);
            }}
            className="w-full h-12 px-3 text-[14px] rounded-lg"
            style={{
              border: "1px solid var(--border-visible)",
              background: "var(--black)",
              color: "var(--text-primary)",
            }}
          />
          {showSuggestions && (
            <div
              className="absolute z-40 w-full mt-1 rounded-lg overflow-hidden"
              style={{
                border: "1px solid var(--border-visible)",
                background: "var(--black)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
              }}
            >
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full px-3 py-2 text-[13px] text-left"
                  style={{
                    background: "transparent",
                    color: "var(--text-primary)",
                    borderBottom: "1px solid var(--border)",
                    border: "none",
                    borderBlockEnd: "1px solid var(--border)",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[var(--text-disabled)] pointer-events-none">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={nominal}
            onChange={handleNominalChange}
            onKeyDown={handleKeyDown}
            className="w-full h-12 pl-8 pr-3 text-[16px] font-bold text-right rounded-lg"
            style={{
              border: nominal
                ? "2px solid var(--accent)"
                : "1px solid var(--border-visible)",
              background: "var(--black)",
              color: nominal ? "var(--accent)" : "var(--text-display)",
            }}
          />
        </div>
      </div>

      {/* Row 3: Category + Note */}
      <div className="grid grid-cols-2 gap-2 relative">
        {/* Date */}
        <DayPicker date={date} onChange={setDate} className="w-full " />
        {/* Category Dropdown */}
        <div className="w-full" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full h-12 px-3 text-[14px] cursor-pointer rounded-lg flex items-center justify-between gap-2"
            style={{
              border: "1px solid var(--border-visible)",
              background: "var(--black)",
              color: "var(--text-primary)",
            }}
          >
            <span className="truncate">{kategori}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                flexShrink: 0,
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <path
                d="M2 4L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              className="absolute z-50 w-full mt-1 rounded-lg overflow-hidden"
              style={{
                border: "1px solid var(--border-visible)",
                background: "var(--black)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              }}
            >
              <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                {categories.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleSelectCategory(k)}
                    className="w-full px-3 py-2.5 text-[13px] text-left cursor-pointer flex items-center gap-2"
                    style={{
                      background:
                        kategori === k ? "var(--surface)" : "transparent",
                      color:
                        kategori === k
                          ? "var(--accent)"
                          : "var(--text-primary)",
                      borderBottom: "1px solid var(--border)",
                      fontWeight: kategori === k ? 600 : 400,
                    }}
                  >
                    {kategori === k && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        style={{ flexShrink: 0 }}
                      >
                        <path
                          d="M1 5.5L3.5 8L9 2"
                          stroke="var(--accent)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    <span className="truncate">{k}</span>
                  </button>
                ))}
              </div>

              <div
                className="flex items-center gap-1.5 p-2"
                style={{
                  borderTop: "1px solid var(--border-visible)",
                  background: "var(--surface)",
                }}
              >
                <input
                  type="text"
                  placeholder="Kategori baru..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={handleNewCatKeyDown}
                  className="flex-1 h-8 px-2.5 text-[12px] rounded-md"
                  style={{
                    border: "1px solid var(--border-visible)",
                    background: "var(--black)",
                    color: "var(--text-primary)",
                    outline: "none",
                    minWidth: 0,
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="h-8 px-2.5 text-[11px] font-mono font-bold rounded-md"
                  style={{
                    background: newCategory.trim()
                      ? "var(--accent)"
                      : "var(--border)",
                    color: newCategory.trim()
                      ? "white"
                      : "var(--text-secondary)",
                    border: "none",
                    cursor: newCategory.trim() ? "pointer" : "default",
                    whiteSpace: "nowrap",
                  }}
                >
                  + Add
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 4: Submit + Note */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Catatan (opsional)"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full h-12 px-3 text-[13px] rounded-lg"
          style={{
            border: "1px solid var(--border-visible)",
            background: "var(--black)",
            color: "var(--text-primary)",
          }}
        />
        <button
          onClick={handleAddTransaction}
          disabled={!canSubmit}
          className="w-full h-12 font-mono text-[13px] font-bold uppercase rounded-lg transition-opacity"
          style={{
            background: canSubmit ? "var(--accent)" : "var(--border)",
            color: canSubmit ? "white" : "var(--text-disabled)",
            border: "none",
            cursor: canSubmit ? "pointer" : "default",
          }}
        >
          Tambah
        </button>
      </div>
    </div>
  );
}
