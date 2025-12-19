import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Создаем JavaScript код для сброса состояния
    const fixScript = `
      <script>
        // Сбрасываем состояние в localStorage
        localStorage.clear();
        
        // Обновляем страницу только один раз
        if (!sessionStorage.getItem('fixed')) {
          sessionStorage.setItem('fixed', 'true');
          window.location.reload();
        }
      </script>
      
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h2>Состояние сброшено</h2>
        <p>Страница будет перезагружена...</p>
        <p>Если не перезагрузилось, <a href="javascript:window.location.reload()">нажмите здесь</a></p>
      </div>
    `;

    return new NextResponse(fixScript, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Fix failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
