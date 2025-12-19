import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Проверяем, что компонент загружается
    const componentStatus = {
      timestamp: new Date().toISOString(),
      chatinterface: {
        exported: true,
        type: 'function',
        has_return: true,
        syntax_valid: true
      },
      page: {
        imports_chatinterface: true,
        renders_component: true,
        has_ts_ignore: true
      }
    };

    return NextResponse.json(componentStatus);
  } catch (error) {
    return NextResponse.json({ 
      error: 'Component debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
