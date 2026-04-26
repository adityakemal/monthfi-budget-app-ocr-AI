import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await req.json();
    
    // Create dynamic SET clause based on provided keys
    const keys = Object.keys(body).filter(k => k !== 'id');
    if (keys.length === 0) return NextResponse.json({ success: true });
    
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => body[k]);
    
    await db.execute({
      sql: `UPDATE transactions SET ${setClause} WHERE id = ?`,
      args: [...values, id]
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    await db.execute({
      sql: 'DELETE FROM transactions WHERE id = ?',
      args: [params.id]
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
