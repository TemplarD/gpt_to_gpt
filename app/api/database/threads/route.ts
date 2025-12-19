import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'chat.db');
const db = new Database(dbPath);

export async function GET() {
  try {
    const threads = db.prepare('SELECT * FROM threads ORDER BY updated_at DESC').all();
    return NextResponse.json(threads);
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, title, updateTitle = false } = await request.json();
    
    if (updateTitle) {
      // Update existing thread title
      const now = new Date().toISOString();
      db.prepare('UPDATE threads SET title = ?, updated_at = ? WHERE id = ?')
        .run(title, now, id);
      
      // Get updated thread
      const thread = db.prepare('SELECT * FROM threads WHERE id = ?').get(id);
      return NextResponse.json(thread);
    } else {
      // Create new thread
      const now = new Date().toISOString();
      db.prepare('INSERT INTO threads (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)')
        .run(id, title, now, now);
      
      return NextResponse.json({ id, title, created_at: now, updated_at: now });
    }
  } catch (error) {
    console.error('Error creating/updating thread:', error);
    return NextResponse.json({ error: 'Failed to create/update thread' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, title } = await request.json();
    
    if (!id || !title) {
      return NextResponse.json({ error: 'Thread ID and title are required' }, { status: 400 });
    }
    
    // Update thread title
    const now = new Date().toISOString();
    db.prepare('UPDATE threads SET title = ?, updated_at = ? WHERE id = ?')
      .run(title, now, id);
    
    // Get updated thread
    const thread = db.prepare('SELECT * FROM threads WHERE id = ?').get(id);
    return NextResponse.json(thread);
  } catch (error) {
    console.error('Error updating thread:', error);
    return NextResponse.json({ error: 'Failed to update thread' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 });
    }
    
    // Delete messages first (due to foreign key constraint)
    db.prepare('DELETE FROM messages WHERE thread_id = ?').run(id);
    
    // Then delete the thread
    db.prepare('DELETE FROM threads WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json({ error: 'Failed to delete thread' }, { status: 500 });
  }
}
