import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'create_test_thread':
        // Создать тестовый тред
        const testThreadId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/threads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: testThreadId, 
            title: 'Тестовый чат для UI'
          }),
        });
        
        // Добавить тестовые сообщения
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: testThreadId,
            messages: [
              {
                id: Math.random().toString(36).substring(2) + Date.now().toString(36),
                role: 'user',
                content: 'Это тестовое сообщение пользователя',
                created_at: new Date().toISOString()
              },
              {
                id: Math.random().toString(36).substring(2) + Date.now().toString(36),
                role: 'assistant',
                content: 'Это тестовый ответ ассистента для проверки UI',
                created_at: new Date().toISOString()
              }
            ]
          })
        });
        
        return NextResponse.json({ 
          success: true, 
          threadId: testThreadId,
          message: 'Тестовый чат создан'
        });
        
      case 'get_threads':
        // Получить все треды
        const threadsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/threads`);
        const threads = await threadsResponse.json();
        
        return NextResponse.json({ 
          success: true, 
          threads,
          count: threads.length
        });
        
      case 'get_messages':
        // Получить сообщения конкретного треда
        const threadId = searchParams.get('threadId');
        if (!threadId) {
          return NextResponse.json({ error: 'threadId required' }, { status: 400 });
        }
        
        const messagesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/messages?threadId=${threadId}`);
        const messages = await messagesResponse.json();
        
        return NextResponse.json({ 
          success: true, 
          threadId,
          messages,
          count: messages.length
        });
        
      case 'clear_all':
        // Очистить все данные (только для тестирования)
        const threadsDeleteResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/threads`, {
          method: 'DELETE'
        });
        
        return NextResponse.json({ 
          success: true, 
          message: 'Все данные очищены'
        });
        
      case 'test_stop_button':
        // Создать тестовый чат с сообщением для тестирования кнопки остановки
        const testThreadId2 = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const testUserMessage = {
          id: Math.random().toString(36).substring(2) + Date.now().toString(36),
          role: 'user',
          content: 'Это тестовое сообщение для проверки кнопки остановки',
          created_at: new Date().toISOString()
        };
        
        // Создать тред
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/threads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: testThreadId2, 
            title: 'Тест кнопки остановки'
          }),
        });
        
        // Добавить сообщение пользователя
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: testThreadId2,
            messages: [testUserMessage]
          })
        });
        
        return NextResponse.json({ 
          success: true, 
          threadId: testThreadId2,
          messageId: testUserMessage.id,
          message: 'Создан тестовый чат для проверки кнопки остановки. Откройте этот чат и проверьте консоль при нажатии кнопки "Остановить"'
        });
        
      case 'simulate_stop':
        // Симуляция нажатия кнопки остановки
        const threadIdToStop = searchParams.get('threadId');
        const messageIdToStop = searchParams.get('messageId');
        
        if (!threadIdToStop || !messageIdToStop) {
          return NextResponse.json({ error: 'threadId and messageId required' }, { status: 400 });
        }
        
        // Получаем сообщения треда
        const stopMessagesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/messages?threadId=${threadIdToStop}`);
        const stopMessages = await stopMessagesResponse.json();
        
        // Находим последнее сообщение пользователя
        const lastUserMessage = stopMessages.filter((m: any) => m.role === 'user').pop();
        
        if (lastUserMessage) {
          return NextResponse.json({ 
            success: true, 
            stoppedMessageId: lastUserMessage.id,
            message: `Симулирована остановка для сообщения: ${lastUserMessage.id}. В консоли должен появиться лог "Setting stoppedMessageId to: ${lastUserMessage.id}"`
          });
        } else {
          return NextResponse.json({ 
            success: false, 
            message: 'Не найдено сообщение пользователя для симуляции остановки'
          });
        }
        
      case 'full_stop_test':
        // Полный тест процесса отправки и остановки
        const testThreadId3 = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const testUserMessage2 = {
          id: Math.random().toString(36).substring(2) + Date.now().toString(36),
          role: 'user',
          content: 'ТЕСТОВОЕ СООБЩЕНИЕ ДЛЯ ПРОВЕРКИ КНОПКИ ОСТАНОВКИ',
          created_at: new Date().toISOString()
        };
        
        // Создать тред
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/threads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: testThreadId3, 
            title: 'ПОЛНЫЙ ТЕСТ КНОПКИ ОСТАНОВКИ'
          }),
        });
        
        // Добавить сообщение пользователя
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: testThreadId3,
            messages: [testUserMessage2]
          })
        });
        
        return NextResponse.json({ 
          success: true, 
          threadId: testThreadId3,
          messageId: testUserMessage2.id,
          instructions: [
            '1. Откройте чат с названием "ПОЛНЫЙ ТЕСТ КНОПКИ ОСТАНОВКИ"',
            '2. В консоли должно появиться сообщение с ID последнего сообщения',
            '3. Отправьте новое сообщение в этом чате',
            '4. Сразу нажмите кнопку "Остановить"',
            '5. В консоли должны появиться логи:',
            '   - "handleStop called"',
            '   - "Setting stoppedMessageId to: [ID]"',
            '   - "Checking button visibility"',
            '6. Под сообщением должна появиться кнопка "Повторить отправку"'
          ]
        });
        
      case 'simulate_stop_ui':
        // Симуляция UI состояния для тестирования кнопки остановки
        const testThreadId4 = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const testUserMessage3 = {
          id: Math.random().toString(36).substring(2) + Date.now().toString(36),
          role: 'user',
          content: 'ТЕСТОВОЕ СООБЩЕНИЕ ДЛЯ ПРОВЕРКИ UI СОСТОЯНИЯ',
          created_at: new Date().toISOString()
        };
        
        // Создать тред
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/threads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: testThreadId4, 
            title: 'ТЕСТ UI СОСТОЯНИЯ ОСТАНОВКИ'
          }),
        });
        
        // Добавить сообщение пользователя
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: testThreadId4,
            messages: [testUserMessage3]
          })
        });
        
        return NextResponse.json({ 
          success: true, 
          threadId: testThreadId4,
          messageId: testUserMessage3.id,
          debugInfo: {
            stoppedMessageId: testUserMessage3.id,
            retryCount: 1,
            expectedBehavior: [
              'При открытии этого чата в UI должно появиться сообщение пользователя',
              'Если нажать DEBUG кнопку, должна появиться иконка повторной отправки',
              'Иконка должна быть круглой со стрелкой и иметь tooltip',
              'Рядом должен появиться счетчик "1 попытка"'
            ]
          }
        });
        
      case 'simple_debug':
        // Максимально простой тест для проверки цепочки
        return NextResponse.json({ 
          success: true, 
          testSteps: [
            '1. Откройте любой чат с сообщением пользователя',
            '2. Нажмите красную DEBUG кнопку "Показать retry"',
            '3. Если кнопка появляется - проблема в handleStop',
            '4. Если кнопка не появляется - проблема в условии отображения',
            '5. Проверьте консоль на логи "Checking button visibility"'
          ],
            expectedConsoleLogs: [
              'DEBUG: Force setting stoppedMessageId to: [ID]',
              'Checking button visibility: {shouldShow: true}',
              'SHOWING retry button for message: [ID]'
            ]
        });
        
      case 'simulate_full_stop_chain':
        // Симуляция полной цепочки: отправка -> загрузка -> остановка -> UI
        const testThreadId5 = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const testUserMessage4 = {
          id: Math.random().toString(36).substring(2) + Date.now().toString(36),
          role: 'user',
          content: 'ТЕСТ ДЛЯ ПРОВЕРКИ ПОЛНОЙ ЦЕПОЧКИ ОСТАНОВКИ',
          created_at: new Date().toISOString()
        };
        
        // Создать тред
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/threads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: testThreadId5, 
            title: 'ПОЛНАЯ ЦЕПОЧКА ОСТАНОВКИ'
          }),
        });
        
        // Добавить сообщение пользователя
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: testThreadId5,
            messages: [testUserMessage4]
          })
        });
        
        return NextResponse.json({ 
          success: true, 
          threadId: testThreadId5,
          messageId: testUserMessage4.id,
          simulationSteps: [
            '1. Создан тестовый чат с сообщением пользователя',
            '2. В UI должно появиться сообщение пользователя',
            '3. Теперь симулируем процесс отправки нового сообщения:',
            '   - Отправьте новое сообщение "тест"',
            '   - Дождитесь начала загрузки (появится анимация)',
            '   - Сразу нажмите кнопку "Остановить"',
            '   - В консоли должен появиться лог "=== HANDLESTOP CALLED ==="',
            '   - Под сообщением должна появиться иконка повторной отправки',
            '5. Если кнопка не появляется - проблема в chatLoading состоянии'
          ],
          debugInfo: {
            expectedChatLoadingState: 'true при отправке сообщения',
            expectedStopButtonCondition: 'chatLoading ? handleStop : undefined',
            expectedHandleStopCall: '=== HANDLESTOP CALLED ===',
            expectedUIState: 'иконка повторной отправки под сообщением'
          }
        });
        
      case 'debug_chatloading':
        // Проверка состояния chatLoading и кнопки остановки
        return NextResponse.json({ 
          success: true, 
          debugInstructions: [
            '1. Откройте консоль браузера (F12)',
            '2. Отправьте любое сообщение в чате',
            '3. Сразу посмотрите в консоль логи:',
            '   - "ChatInterface render state: {chatLoading: true}"',
            '   - Если chatLoading:false - проблема в установке состояния',
            '4. Попробуйте нажать кнопку "Остановить"',
            '5. Если в консоли нет "=== HANDLESTOP CALLED" - кнопка не работает',
            '6. Используйте оранжевую кнопку "TEST: handleStop" для проверки'
          ],
          expectedConsolePattern: [
            'handleSubmit called',
            'setChatLoading(true)',
            'ChatInterface render state: {chatLoading: true}',
            'handleStop called (при нажатии кнопки)',
            'setChatLoading(false)'
          ],
          troubleshooting: [
            'Если chatLoading не становится true - проблема в handleSubmit',
            'Если handleStop не вызывается - проблема в onClick условии',
            'Если кнопка появляется после TEST handleStop - проблема в chatLoading'
          ]
        });
        
      case 'test_delayed_stop':
        // Создать тестовый чат с задержкой для проверки кнопки остановки
        const testThreadId6 = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const testUserMessage5 = {
          id: Math.random().toString(36).substring(2) + Date.now().toString(36),
          role: 'user',
          content: 'ТЕСТ С ЗАДЕРЖКОЙ ДЛЯ ПРОВЕРКИ КНОПКИ ОСТАНОВКИ',
          created_at: new Date().toISOString()
        };
        
        // Создать тред
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/threads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: testThreadId6, 
            title: 'ТЕСТ С ЗАДЕРЖКОЙ ОСТАНОВКИ'
          }),
        });
        
        // Добавить сообщение пользователя
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/database/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId: testThreadId6,
            messages: [testUserMessage5]
          })
        });
        
        return NextResponse.json({ 
          success: true, 
          threadId: testThreadId6,
          messageId: testUserMessage5.id,
          testInstructions: [
            '1. Откройте чат "ТЕСТ С ЗАДЕРЖКОЙ ОСТАНОВКИ"',
            '2. Отправьте новое сообщение "тест задержки"',
            '3. У вас будет 3 секунды чтобы нажать кнопку "Остановить"',
            '4. Наблюдайте за поведением кнопки повторной отправки:',
            '   - Кнопка должна появиться и остаться видимой',
            '   - Если кнопка появляется и пропадает - проблема в состоянии',
            '5. Проверьте консоль на логи:',
            '   - "=== HANDLESTOP CALLED ==="',
            '   - "Setting stoppedMessageId to: [ID]"',
            '   - "SIMPLE CHECK: {condition: true}"'
          ],
          expectedBehavior: {
            buttonAppear: 'Кнопка появляется при остановке',
            buttonStay: 'Кнопка остается видимой',
            noDuplication: 'Сообщения не дублируются при повторной отправке',
            counterWorks: 'Счетчик попыток увеличивается корректно'
          },
          debugInfo: {
            delay: '3 секунды на нажатие кнопки остановки',
            watchFor: 'Мигание кнопки или исчезновение',
            consoleLogs: 'Логи состояния stoppedMessageId'
          }
        });
        
      default:
        return NextResponse.json({
          success: false,
          message: 'Неизвестное действие',
          available_actions: [
            'create_test_thread - создать тестовый чат',
            'get_threads - получить все чаты',
            'get_messages?threadId=X - получить сообщения чата',
            'clear_all - очистить все данные',
            'test_stop_button - создать тестовый чат для проверки кнопки остановки',
            'simulate_stop?threadId=X&messageId=Y - симулировать нажатие кнопки остановки',
            'full_stop_test - полный тест кнопки остановки с инструкциями',
            'simulate_stop_ui - создать тестовый чат для проверки UI состояния кнопки остановки',
            'simple_debug - простой тест для проверки цепочки отображения кнопки',
            'simulate_full_stop_chain - симуляция полной цепочки отправка-остановка-UI',
            'debug_chatloading - диагностика состояния chatLoading и кнопки остановки',
            'test_delayed_stop - тест с задержкой для проверки кнопки остановки'
          ]
        });
    }
  } catch (error) {
    console.error('Test UI API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
