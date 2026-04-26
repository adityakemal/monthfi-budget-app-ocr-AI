import { createClient } from '@libsql/client';
import path from 'path';

// Use /app/data/budget.db ONLY if we are explicitly running inside Docker
// Otherwise, stick to the project root (important for local builds)
const dbPath = process.env.DOCKER === '1'
  ? '/app/data/budget.db'
  : path.join(process.cwd(), 'budget.db');

const db = createClient({
  url: `file:${dbPath}`,
});

export async function initDb() {
  // Initialize tables
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nominal INTEGER NOT NULL,
      kategori TEXT NOT NULL,
      keterangan TEXT,
      date TEXT NOT NULL,
      source TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      name TEXT PRIMARY KEY
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default categories if empty
  const countCats = await db.execute('SELECT COUNT(*) as count FROM categories');
  if (Number(countCats.rows[0].count) === 0) {
    const defaultCats = ["Makanan", "Transport", "Belanja", "Hiburan", "Tagihan"];
    const statements = defaultCats.map(cat => ({
      sql: 'INSERT INTO categories (name) VALUES (?)',
      args: [cat]
    }));
    await db.batch(statements, 'write');
  }

  // Ensure default budget exists
  const defaultBudget = await db.execute({
    sql: 'SELECT value FROM settings WHERE key = ?',
    args: ['defaultBudget']
  });
  if (defaultBudget.rows.length === 0) {
    await db.execute({
      sql: 'INSERT INTO settings (key, value) VALUES (?, ?)',
      args: ['defaultBudget', '0']
    });
  }
}

// Call init when module loads
initDb().catch(console.error);

export default db;
