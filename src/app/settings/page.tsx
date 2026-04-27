"use client";

import { useRouter } from "next/navigation";
import { BottomNav, AppHeader, CategoryManager } from "@/components";
import { logoutUser } from "@/app/action";

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    // Menghapus HttpOnly cookie via Server Action
    await logoutUser();
    // Gunakan window.location agar middleware Next.js mereset status secara penuh
    window.location.href = "/login";
  };

  return (
    <main className="flex-1 py-5 px-4 font-space-grotesk text-[var(--text-primary)]">
      {/* Header */}
      <AppHeader title="Pengaturan" isShowDatepicker={false} />

      <div className="space-y-6 mt-6">
        {/* Kategori Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider pl-2">
            Manajemen Kategori
          </h2>
          <CategoryManager />
        </section>

        {/* Akun Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider pl-2">
            Akun
          </h2>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg transition-colors text-left cursor-pointer hover:bg-red-500/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </div>
              <span className="font-medium text-red-500">Keluar</span>
            </div>
          </button>
        </section>

        {/* Info Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider pl-2">
            Informasi
          </h2>
          <div className="glass-panel overflow-hidden divide-y divide-[var(--border)]">
            <button className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-hover)] transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-secondary)]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <span className="font-medium text-[var(--text)]">
                  Tentang sesaKu
                </span>
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
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <button className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-hover)] transition-colors text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-secondary)]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                </div>
                <span className="font-medium text-[var(--text)]">
                  Bantuan & Dukungan
                </span>
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
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </section>

        <div className="text-center pt-8">
          <p className="text-xs text-[var(--text-secondary)]">sesaKu v1.0.0</p>
          <p className="text-xs text-[var(--text-secondary)] opacity-50">
            © 2026 Cubybot Studio
          </p>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
