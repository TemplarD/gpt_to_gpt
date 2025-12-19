import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Проверяем состояние сервера
    const status = {
      timestamp: new Date().toISOString(),
      server: 'running',
      frontend: {
        component_loaded: true,
        current_thread_id: 'unknown',
        messages_count: 'unknown'
      }
    };

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
