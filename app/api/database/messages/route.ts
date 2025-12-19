import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'chat.db');
const db = new Database(dbPath);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');
    
    if (!threadId) {
      return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 });
    }
    
    const messages = db.prepare('SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC')
      .all(threadId);
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, thread_id, role, content } = await request.json();
    const now = new Date().toISOString();
    
    db.prepare('INSERT INTO messages (id, thread_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(id, thread_id, role, content, now);
    
    // Update thread timestamp
    db.prepare('UPDATE threads SET updated_at = ? WHERE id = ?').run(now, thread_id);
    
    return NextResponse.json({ id, thread_id, role, content, created_at: now });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
