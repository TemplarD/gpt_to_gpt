import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: "Откройте консоль (F12) и выполните:",
      commands: [
        "localStorage.clear();",
        "location.reload();"
      ],
      instructions: "Или просто закройте эту вкладку и откройте http://localhost:3000 в новой"
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Clear failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
