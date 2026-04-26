import { NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Transaction } from '@/types';

export async function GET() {
  try {
    const res = await db.execute('SELECT * FROM transactions ORDER BY date DESC');
    const transactions = res.rows as unknown as Transaction[];
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await db.execute({
      sql: 'INSERT INTO transactions (id, name, nominal, kategori, keterangan, date, source) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [body.id, body.name, body.nominal, body.kategori, body.keterangan || '', body.date, body.source]
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
