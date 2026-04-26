import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const res = await db.execute('SELECT name FROM categories');
    return NextResponse.json(res.rows.map(c => c.name as string));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    await db.execute({
      sql: 'INSERT OR IGNORE INTO categories (name) VALUES (?)',
      args: [name.trim()]
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    if (name) {
      await db.execute({
        sql: 'DELETE FROM categories WHERE name = ?',
        args: [name]
      });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
