import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Проверяем фронтенд
    const frontendDebug = {
      timestamp: new Date().toISOString(),
      issues: [],
      checks: {
        html_contains_main: true,
        html_contains_chatinterface: true,
        welcome_screen_visible: false,
        current_thread_id_empty: false
      },
      recommendations: [
        "Check browser console for JavaScript errors",
        "Verify currentThreadId is empty string",
        "Check if welcome screen condition is working"
      ]
    };

    // Проверяем HTML страницы
    const htmlResponse = await fetch('http://localhost:3000');
    const html = await htmlResponse.text();
    
    if (html.includes('Добро пожаловать')) {
      frontendDebug.checks.welcome_screen_visible = true;
    }
    
    if (html.includes('ChatInterface')) {
      frontendDebug.checks.html_contains_chatinterface = true;
    }

    return NextResponse.json(frontendDebug);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Frontend debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
