"use client";

import { useState, useRef, useEffect } from "react";
import dayjs from "dayjs";
import type { Transaction } from "@/types";
import { formatCurrency } from "@/utils";
import { useBudgetStore } from "@/store/budget";
import { DayPicker } from "./DatePicker";

interface TransactionListProps {
  transactions: Transaction[];
}

type SortField = "date" | "name" | "nominal" | "source" | "kategori";
type SortOrder = "asc" | "desc";

export function TransactionList({ transactions }: TransactionListProps) {
  const { deleteTransaction, updateTransaction, categories, addCategory } =
    useBudgetStore();
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-[14px]" style={{ color: "var(--text-disabled)" }}>
          Belum ada transaksi
        </p>
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder(field === "name" ? "asc" : "desc");
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (sortField === "name") {
      valA = (a.name || "").toLowerCase();
      valB = (b.name || "").toLowerCase();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="opacity-30">↕</span>;
    return <span>{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div className="space-y-4">
      <div
        className="overflow-x-auto rounded-lg"
        style={{ border: "1px solid var(--border)" }}
      >
        <table
          className="w-full text-left border-collapse"
          style={{ minWidth: "500px" }}
        >
          <thead>
            <tr
              style={{
                background: "var(--surface-raised)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <th
                className="p-3 text-[12px] font-medium cursor-pointer hover:bg-white/5 transition-colors w-[80px]"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center gap-1">
                  Tanggal <SortIcon field="date" />
                </div>
              </th>
              <th
                className="p-3 text-[12px] font-medium cursor-pointer hover:bg-white/5 transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Name <SortIcon field="name" />
                </div>
              </th>
              <th
                className="p-3 text-[12px] font-medium cursor-pointer hover:bg-white/5 transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => handleSort("kategori")}
              >
                <div className="flex items-center gap-1">
                  Kategori <SortIcon field="kategori" />
                </div>
              </th>
              <th
                className="p-3 text-[12px] font-medium cursor-pointer hover:bg-white/5 transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => handleSort("source")}
              >
                <div className="flex items-center gap-1 whitespace-nowrap">
                  Added By <SortIcon field="source" />
                </div>
              </th>
              <th
                className="p-3 text-[12px] font-medium cursor-pointer hover:bg-white/5 transition-colors text-right"
                style={{ color: "var(--text-secondary)" }}
                onClick={() => handleSort("nominal")}
              >
                <div className="flex items-center justify-end gap-1">
                  Nominal <SortIcon field="nominal" />
                </div>
              </th>
              <th
                className="p-3 text-[12px] font-medium text-center w-[50px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((t, idx) => (
              <tr
                key={t.id}
                className="group"
                style={{
                  borderBottom:
                    idx < sortedTransactions.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                  background: "var(--black)",
                }}
              >
                <td className="p-3 whitespace-nowrap">
                  <div className="flex flex-col">
                    <div
                      className="font-medium text-[11px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {dayjs(t.date).format("DD/MM/YY")}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <p
                    className="text-[14px] font-medium"
                    style={{ color: "var(--text-display)" }}
                  >
                    {t.name || "—"}
                  </p>
                  {t.keterangan && (
                    <div
                      className="text-[11px] truncate max-w-[150px] mt-0.5"
                      style={{ color: "var(--text-disabled)" }}
                    >
                      {t.keterangan}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className="px-1.5 py-px rounded text-[10px] font-mono"
                    style={{
                      background: "var(--surface)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t.kategori}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase"
                    style={{
                      background:
                        t.source === "AI"
                          ? "rgba(91,155,246,0.15)"
                          : "rgba(74,158,92,0.15)",
                      color:
                        t.source === "AI"
                          ? "rgba(91,155,246,0.9)"
                          : "rgba(74,158,92,0.9)",
                    }}
                  >
                    {t.source || "Web"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <span
                    className="text-[13px] font-mono font-bold whitespace-nowrap"
                    style={{ color: "var(--accent)" }}
                  >
                    {formatCurrency(t.nominal)}
                  </span>
                </td>
                <td className="p-3 relative">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() =>
                        setActionMenuOpen(actionMenuOpen === t.id ? null : t.id)
                      }
                      className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-white/10"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <circle cx="8" cy="4" r="1.5" />
                        <circle cx="8" cy="8" r="1.5" />
                        <circle cx="8" cy="12" r="1.5" />
                      </svg>
                    </button>
                  </div>
                  {actionMenuOpen === t.id && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setActionMenuOpen(null)}
                      />
                      <div
                        className="absolute right-8 top-1/2 -translate-y-1/2 w-28 rounded-lg shadow-xl z-50 overflow-hidden"
                        style={{
                          background: "var(--surface-raised)",
                          border: "1px solid var(--border-visible)",
                        }}
                      >
                        <button
                          onClick={() => {
                            setEditingTx(t);
                            setActionMenuOpen(null);
                          }}
                          className="w-full px-3 py-2 text-left text-[12px] font-medium transition-colors hover:bg-white/5"
                          style={{
                            color: "var(--text-primary)",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setDeletingTx(t.id);
                            setActionMenuOpen(null);
                          }}
                          className="w-full px-3 py-2 text-left text-[12px] font-bold transition-colors hover:bg-white/5"
                          style={{ color: "var(--accent)" }}
                        >
                          Hapus
                        </button>
                      </div>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingTx && (
        <EditModal
          transaction={editingTx}
          categories={categories}
          addCategory={addCategory}
          onSave={(updates) => {
            updateTransaction(editingTx.id, updates);
            setEditingTx(null);
          }}
          onClose={() => setEditingTx(null)}
        />
      )}

      {deletingTx && (
        <DeleteConfirmModal
          onConfirm={() => {
            deleteTransaction(deletingTx);
            setDeletingTx(null);
          }}
          onClose={() => setDeletingTx(null)}
        />
      )}
    </div>
  );
}

function DeleteConfirmModal({
  onConfirm,
  onClose,
}: {
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-visible)",
        }}
      >
        <div
          className="p-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <p
            className="text-[16px] font-semibold text-center"
            style={{ color: "var(--text-display)" }}
          >
            Hapus Transaksi
          </p>
        </div>

        <div className="p-5 text-center">
          <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
            Yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat
            dikembalikan.
          </p>
        </div>

        <div
          className="p-4 flex gap-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onConfirm}
            className="flex-1 h-10 text-[13px] font-bold rounded-lg"
            style={{
              background: "var(--accent)",
              color: "white",
              border: "none",
            }}
          >
            Hapus
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-10 text-[13px] font-medium rounded-lg"
            style={{
              border: "1px solid var(--border-visible)",
              color: "var(--text-primary)",
              background: "transparent",
            }}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({
  transaction,
  categories,
  addCategory,
  onSave,
  onClose,
}: {
  transaction: Transaction;
  categories: string[];
  addCategory: (cat: string) => void;
  onSave: (updates: Partial<Transaction>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(transaction.name || "");
  const [nominal, setNominal] = useState(transaction.nominal.toString());
  const [kategori, setKategori] = useState(transaction.kategori);
  const [keterangan, setKeterangan] = useState(transaction.keterangan || "");
  const [date, setDate] = useState(() =>
    dayjs(transaction.date).format("YYYY-MM-DD"),
  );
  const [newCat, setNewCat] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectCategory = (cat: string) => {
    setKategori(cat);
    setDropdownOpen(false);
  };

  const handleNewCatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCat();
    }
  };

  const formatInput = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    if (!num) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(num, 10));
  };

  const handleSave = () => {
    const val = parseInt(nominal.replace(/[^0-9]/g, ""), 10);
    const safeName = name ? name.trim() : "";
    if (val > 0 && safeName && kategori) {
      onSave({
        name: safeName,
        nominal: val,
        kategori,
        keterangan,
        date: dayjs(date).toISOString(),
      });
    }
  };

  const handleAddCat = () => {
    const trimmed = newCat.trim();
    if (trimmed) {
      addCategory(trimmed);
      setKategori(trimmed);
      setNewCat("");
      setDropdownOpen(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-visible)",
        }}
      >
        <div
          className="p-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <p
            className="text-[16px] font-semibold"
            style={{ color: "var(--text-display)" }}
          >
            Edit Transaksi
          </p>
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

        <div className="p-5 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label
                className="block text-[12px] mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Nama
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 text-[14px] rounded-lg"
                style={{
                  border: "1px solid var(--border-visible)",
                  background: "var(--black)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div className="w-[140px]">
              <label
                className="block text-[12px] mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Nominal
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[var(--text-disabled)] pointer-events-none">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatInput(nominal)}
                  onChange={(e) =>
                    setNominal(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  className="w-full h-10 pl-8 pr-3 text-[14px] font-bold text-right rounded-lg"
                  style={{
                    border: "1px solid var(--border-visible)",
                    background: "var(--black)",
                    color: "var(--text-display)",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="w-[140px]">
              <label
                className="block text-[12px] mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Tanggal
              </label>
              <DayPicker
                date={date}
                onChange={setDate}
                className="w-full h-10"
              />
            </div>
            <div className="flex-1">
              <label
                className="block text-[12px] mb-1"
                style={{ color: "var(--text-secondary)" }}
              >
                Kategori
              </label>
              <div className="relative w-full" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full h-10 px-3 text-[14px] cursor-pointer rounded-lg flex items-center justify-between gap-2"
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
                      transform: dropdownOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
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
                    <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                      {categories.map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleSelectCategory(k)}
                          className="w-full px-3 py-2 text-[13px] text-left cursor-pointer flex items-center gap-2"
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
                        value={newCat}
                        onChange={(e) => setNewCat(e.target.value)}
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
                        onClick={handleAddCat}
                        className="h-8 px-2.5 text-[11px] font-mono font-bold rounded-md"
                        style={{
                          background: newCat.trim()
                            ? "var(--accent)"
                            : "var(--border)",
                          color: newCat.trim()
                            ? "white"
                            : "var(--text-secondary)",
                          border: "none",
                          cursor: newCat.trim() ? "pointer" : "default",
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
          </div>

          <div>
            <label
              className="block text-[12px] mb-1"
              style={{ color: "var(--text-secondary)" }}
            >
              Catatan
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full h-10 px-3 text-[14px] rounded-lg"
              style={{
                border: "1px solid var(--border-visible)",
                background: "var(--black)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          <div className="flex gap-2 pt-2">
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
              disabled={!name.trim() || !nominal || parseInt(nominal) <= 0}
              className="flex-1 h-11 text-[13px] font-bold rounded-lg disabled:opacity-50"
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
