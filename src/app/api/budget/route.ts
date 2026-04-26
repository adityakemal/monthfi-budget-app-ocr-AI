import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const defaultRes = await db.execute({
      sql: 'SELECT value FROM settings WHERE key = ?',
      args: ['defaultBudget']
    });
    const defaultBudget = defaultRes.rows.length > 0 ? parseInt(defaultRes.rows[0].value as string, 10) : 0;
    
    const monthlyRes = await db.execute("SELECT * FROM settings WHERE key LIKE 'budget_%'");
    const monthlyBudgets = monthlyRes.rows.map(b => ({
      month: (b.key as string).replace('budget_', ''),
      amount: parseInt(b.value as string, 10)
    }));
    
    return NextResponse.json({
      defaultBudget,
      monthlyBudgets
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.type === 'default') {
      await db.execute({
        sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        args: ['defaultBudget', body.amount.toString()]
      });
    } else if (body.type === 'monthly') {
      await db.execute({
        sql: 'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        args: [`budget_${body.month}`, body.amount.toString()]
      });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
