import { NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Transaction } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const txRes = await db.execute('SELECT * FROM transactions ORDER BY date DESC');
    const transactions = txRes.rows as unknown as Transaction[];

    const catRes = await db.execute('SELECT name FROM categories');
    const categories = catRes.rows.map(row => row.name as string);
    
    const dbRes = await db.execute({ sql: 'SELECT value FROM settings WHERE key = ?', args: ['defaultBudget'] });
    const defaultBudget = dbRes.rows.length > 0 ? parseInt(dbRes.rows[0].value as string, 10) : 0;
    
    const mbRes = await db.execute("SELECT * FROM settings WHERE key LIKE 'budget_%'");
    const monthlyBudgets = mbRes.rows.map(b => ({
      month: (b.key as string).replace('budget_', ''),
      amount: parseInt(b.value as string, 10)
    }));

    return NextResponse.json({
      transactions,
      categories,
      defaultBudget,
      monthlyBudgets
    });
  } catch (error: any) {
    console.error("State GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const state = await req.json();
    const statements: any[] = [];
    
    if (state.transactions && state.transactions.length > 0) {
      for (const tx of state.transactions) {
        statements.push({
          sql: 'INSERT OR REPLACE INTO transactions (id, name, nominal, kategori, keterangan, date, source) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [tx.id, tx.name || 'Migrated', tx.nominal, tx.kategori, tx.keterangan || '', tx.date, tx.source || 'Web']
        });
      }
    }

    if (state.categories && state.categories.length > 0) {
      for (const cat of state.categories) {
        statements.push({
          sql: 'INSERT OR IGNORE INTO categories (name) VALUES (?)',
          args: [cat]
        });
      }
    }

    if (state.defaultBudget !== undefined) {
      statements.push({
        sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        args: ['defaultBudget', state.defaultBudget.toString()]
      });
    }

    if (state.monthlyBudgets && state.monthlyBudgets.length > 0) {
      for (const b of state.monthlyBudgets) {
        statements.push({
          sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
          args: [`budget_${b.month}`, b.amount.toString()]
        });
      }
    }

    if (statements.length > 0) {
      await db.batch(statements, 'write');
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("State POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
