"use client";

import { useState } from "react";
import { useBudgetStore } from "@/store/budget";

export function CategoryManager() {
  const { categories, removeCategory } = useBudgetStore();
  const [deletingCat, setDeletingCat] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div
        className="overflow-hidden rounded-xl"
        style={{ border: "1px solid var(--border)", background: "var(--surface)" }}
      >
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--background)", color: "var(--text-secondary)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </div>
            <span className="font-medium" style={{ color: "var(--text-display)" }}>Daftar Kategori ({categories.length})</span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease"
            }}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        {isOpen && (
          <div style={{ borderTop: "1px solid var(--border)" }}>
            <table className="w-full text-left border-collapse">
          <thead>
            <tr
              style={{
                background: "var(--surface-raised)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <th
                className="p-3 text-[12px] font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Kategori
              </th>
              <th
                className="p-3 text-[12px] font-medium text-center w-[60px]"
                style={{ color: "var(--text-secondary)" }}
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, idx) => (
              <tr
                key={cat}
                className="group"
                style={{
                  borderBottom:
                    idx < categories.length - 1
                      ? "1px solid var(--border)"
                      : "none",
                  background: "var(--black)",
                }}
              >
                <td className="p-3">
                  <span
                    className="px-2 py-1 rounded text-[12px] font-mono font-medium"
                    style={{
                      background: "var(--surface)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {cat}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => setDeletingCat(cat)}
                    className="w-7 h-7 flex items-center justify-center rounded transition-colors hover:bg-red-500/10 mx-auto group"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[var(--text-secondary)] group-hover:text-red-500 transition-colors"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={2} className="p-4 text-center">
                  <span
                    className="text-[12px]"
                    style={{ color: "var(--text-disabled)" }}
                  >
                    Tidak ada kategori.
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        )}
      </div>

      {deletingCat && (
        <DeleteCatConfirmModal
          category={deletingCat}
          onConfirm={() => {
            removeCategory(deletingCat);
            setDeletingCat(null);
          }}
          onClose={() => setDeletingCat(null)}
        />
      )}
    </div>
  );
}

function DeleteCatConfirmModal({
  category,
  onConfirm,
  onClose,
}: {
  category: string;
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
            Hapus Kategori
          </p>
        </div>

        <div className="p-5 text-center">
          <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
            Yakin ingin menghapus kategori{" "}
            <span className="font-bold text-[var(--text-primary)]">
              "{category}"
            </span>
            ?
          </p>
          <p className="text-[12px] mt-2 text-yellow-500/80">
            Transaksi lama yang menggunakan kategori ini akan tetap memiliki nama kategori tersebut.
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
