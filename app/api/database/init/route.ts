import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function POST() {
  try {
    const dbPath = path.join(process.cwd(), 'chat.db');
    const db = new Database(dbPath);

    // Create threads table
    db.exec(`
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create messages table
    db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (thread_id) REFERENCES threads (id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    db.exec('CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_threads_updated_at ON threads(updated_at DESC)');

    db.close();
    
    return NextResponse.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}
