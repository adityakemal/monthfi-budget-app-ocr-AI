export type TransactionSource = 'Web' | 'AI';

export interface Transaction {
  id: string;
  name: string;
  nominal: number;
  kategori: string;
  keterangan: string;
  date: string; // ISO string
  source: TransactionSource;
}

export interface MonthlyBudget {
  month: string; // "YYYY-MM" format
  amount: number;
}

export interface BudgetState {
  // Data
  defaultBudget: number;
  monthlyBudgets: MonthlyBudget[];
  transactions: Transaction[];
  categories: string[];

  // Actions
  setDefaultBudget: (amount: number) => void;
  setMonthlyBudget: (month: string, amount: number) => void;
  getBudgetForMonth: (month: string) => number;
  addTransaction: (t: Omit<Transaction, "id" | "date" | "source"> & { source?: TransactionSource; date?: string }) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  initStore: () => Promise<void>;
  importData: (transactions: Transaction[]) => Promise<void>;
}

export const DEFAULT_CATEGORIES = [
  "Makanan",
  "Transport",
  "Belanja",
  "Hiburan",
  "Tagihan",
] as const;

export const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
] as const;

/** Helper to get "YYYY-MM" key from a Date */
export function toMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}