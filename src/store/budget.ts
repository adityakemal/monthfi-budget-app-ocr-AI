import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BudgetState, Transaction } from '@/types';
import { DEFAULT_CATEGORIES } from '@/types';

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      defaultBudget: 0,
      monthlyBudgets: [],
      transactions: [],
      categories: [...DEFAULT_CATEGORIES],

      initStore: async () => {
        try {
          const res = await fetch('/api/state');
          if (!res.ok) {
            const errText = await res.text();
            console.error("Failed to fetch state:", res.status, errText);
            return;
          }
          const data = await res.json();
          
          const localState = get();
          
          // If SQLite is empty but we have local data, bulk upload!
          if (data.transactions.length === 0 && localState.transactions.length > 0) {
            await fetch('/api/state', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(localState)
            });
            // Re-fetch after sync
            const res2 = await fetch('/api/state');
            const data2 = await res2.json();
            set({
              transactions: data2.transactions,
              categories: data2.categories,
              defaultBudget: data2.defaultBudget,
              monthlyBudgets: data2.monthlyBudgets
            });
          } else {
            // SQLite has data, so we use it as source of truth
            set({
              transactions: data.transactions,
              categories: data.categories,
              defaultBudget: data.defaultBudget,
              monthlyBudgets: data.monthlyBudgets
            });
          }
        } catch (err) {
          console.error("Failed to init store from API", err);
        }
      },

      importData: async (transactions) => {
        // Send to bulk state API
        await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions })
        });
        get().initStore();
      },

      setDefaultBudget: (amount) => {
        set({ defaultBudget: amount });
        fetch('/api/budget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'default', amount })
        });
      },

      setMonthlyBudget: (month, amount) => {
        set((s) => {
          const existing = s.monthlyBudgets.findIndex((b) => b.month === month);
          if (existing >= 0) {
            const updated = [...s.monthlyBudgets];
            updated[existing] = { month, amount };
            return { monthlyBudgets: updated };
          }
          return { monthlyBudgets: [...s.monthlyBudgets, { month, amount }] };
        });
        fetch('/api/budget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'monthly', month, amount })
        });
      },

      getBudgetForMonth: (month) => {
        const state = get();
        const specific = state.monthlyBudgets.find((b) => b.month === month);
        return specific ? specific.amount : state.defaultBudget;
      },

      addTransaction: (t) => {
        const newTx = { ...t, id: crypto.randomUUID(), date: t.date || new Date().toISOString(), source: t.source || 'Web' } as Transaction;
        set((s) => ({
          transactions: [...s.transactions, newTx],
        }));
        fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTx)
        });
      },

      updateTransaction: (id, updates) => {
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
        
        const tx = get().transactions.find(t => t.id === id);
        if (tx) {
          fetch(`/api/transactions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tx)
          });
        }
      },

      deleteTransaction: (id) => {
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        }));
        fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      },

      addCategory: (category) => {
        const trimmed = category.trim();
        if (!trimmed) return;
        set((s) => {
          const exists = s.categories.some(
            (c) => c.toLowerCase() === trimmed.toLowerCase()
          );
          if (exists) return s;
          return { categories: [...s.categories, trimmed] };
        });
        fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmed })
        });
      },

      removeCategory: (category) => {
        set((s) => ({
          categories: s.categories.filter((c) => c !== category),
        }));
        fetch(`/api/categories?name=${encodeURIComponent(category)}`, { method: 'DELETE' });
      },
    }),
    { name: 'monthfi-store' }
  )
);