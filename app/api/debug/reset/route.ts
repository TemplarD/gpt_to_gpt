import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Сбрасываем состояние для тестирования
    const resetStatus = {
      timestamp: new Date().toISOString(),
      action: 'reset_frontend_state',
      result: 'success',
      message: 'State reset. Refresh the page to see welcome screen.'
    };

    return NextResponse.json(resetStatus);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Reset failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
