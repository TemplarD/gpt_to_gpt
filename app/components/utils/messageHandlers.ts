// Функции для отправки сообщений и повторных попыток

import { Message } from '../types';

export const handleSubmit = async (
  e: React.FormEvent,
  input: string,
  setInput: (input: string) => void,
  currentThreadId: string | null,
  setCurrentThreadId: (id: string | null) => void,
  messages: Message[],
  setMessages: (messages: Message[]) => void,
  chatLoading: Record<string, boolean>,
  setChatLoading: (loading: Record<string, boolean>) => void,
  setAbortController: (controller: AbortController | null) => void,
  setWasStopped: (stopped: boolean) => void,
  streamingMode: boolean,
  loadThreads: () => Promise<void>,
  loadMessages: (threadId: string) => Promise<void>,
  wasStopped: boolean,
  currentModel: string,
  modelSettings: any,
  stoppedMessageId: Record<string, string>,
  setStoppedMessageId: (stopped: Record<string, string>) => void
): Promise<void> => {
  e.preventDefault();
  if (!input.trim()) return;

  let assistantMessageId = "";
  let assistantMessage = "";

  const userMessage: Message = {
    id: Math.random().toString(36).substring(2) + Date.now().toString(36),
    role: "user" as const,
    content: input.trim(),
    created_at: new Date().toISOString(),
  };

  if (!currentThreadId) {
    // Create new thread
    const newThreadId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    setCurrentThreadId(newThreadId);
    setMessages([userMessage]);
    setInput("");
    
    // Create thread in database
    await fetch('/api/database/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: newThreadId, 
        title: 'Новый чат',
      }),
    });
    
    await loadThreads();
  } else {
    // For existing threads
    setMessages([...messages, userMessage]);
    setInput("");
    const newLoading: Record<string, boolean> = { ...chatLoading };
    newLoading[currentThreadId!] = true;
    setChatLoading(newLoading);

    // Create AbortController for this request
    const controller = new AbortController();
    setAbortController(controller);
    
    // Reset stopped flag at the start of each request
    setWasStopped(false);

    try {
      // Add delay for testing if message contains "тест задержки"
      const shouldAddDelay = userMessage.content.includes('тест задержки');
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          threadId: currentThreadId,
          streamingMode,
          addDelay: shouldAddDelay,
          currentModel,
          modelSettings
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (errorData.needsConfiguration && errorData.message) {
          // Show configuration error message
          const errorMessage: Message = {
            id: Math.random().toString(36).substring(2) + Date.now().toString(36),
            role: "assistant",
            content: errorData.message,
            created_at: new Date().toISOString(),
          };
          
          setMessages([...messages, errorMessage]);
          const newLoading: Record<string, boolean> = { ...chatLoading };
          newLoading[currentThreadId!] = false;
          setChatLoading(newLoading);
          return;
        }
        
        throw new Error('Failed to send message');
      }

      if (streamingMode) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          buffer += decoder.decode(value);
          const lines = buffer.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  assistantMessage += data.content;
                  if (!assistantMessageId) {
                    assistantMessageId = Math.random().toString(36).substring(2) + Date.now().toString(36);
                  }
                  const updated = [...messages];
                  const lastMessage = updated[updated.length - 1];
                  if (lastMessage && lastMessage.id === assistantMessageId) {
                    lastMessage.content = assistantMessage;
                  } else {
                    updated.push({
                      id: assistantMessageId,
                      role: 'assistant' as const,
                      content: assistantMessage,
                      created_at: new Date().toISOString(),
                    });
                  }
                  setMessages(updated);
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
            }
          }
        }
      } else {
        // Handle full response
        const text = await response.text();
        const assistantMessage: Message = {
          id: Math.random().toString(36).substring(2) + Date.now().toString(36),
          role: "assistant" as const,
          content: text,
          created_at: new Date().toISOString(),
        };
        setMessages([...messages, assistantMessage]);
      }

      await loadThreads();
      
      // Reload messages to ensure they're saved and displayed
      if (currentThreadId) {
        await loadMessages(currentThreadId);
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      // Always reset chatLoading unless user stopped the process
      if (!wasStopped) {
        const newLoading: Record<string, boolean> = { ...chatLoading };
        newLoading[currentThreadId!] = false;
        setChatLoading(newLoading);
        setAbortController(null);
      }
      // Reset stopped flag
      setWasStopped(false);
    }
  }
};

export const handleRetry = async (
  messageId: string,
  currentThreadId: string | null,
  messages: Message[],
  chatLoading: Record<string, boolean>,
  setMessages: (messages: Message[]) => void,
  setChatLoading: (loading: Record<string, boolean>) => void,
  setAbortController: (controller: AbortController | null) => void,
  setWasStopped: (stopped: boolean) => void,
  setStoppedMessageId: (stopped: Record<string, string>) => void,
  stoppedMessageId: Record<string, string>,
  streamingMode: boolean,
  loadThreads: () => Promise<void>,
  loadMessages: (threadId: string) => Promise<void>,
  wasStopped: boolean
): Promise<void> => {
  if (!currentThreadId) return;
  
  let assistantMessageId = "";
  let assistantMessage = "";
  
  // Reset stopped message for current thread
  const newStopped: Record<string, string> = { ...stoppedMessageId };
  delete newStopped[currentThreadId];
  setStoppedMessageId(newStopped);
  
  const messageToRetry = messages.find(m => m.id === messageId);
  if (!messageToRetry) return;

  const newLoading: Record<string, boolean> = { ...chatLoading };
  newLoading[currentThreadId!] = true;
  setChatLoading(newLoading);
  // Reset stopped flag at the start of retry
  setWasStopped(false);

  // Create AbortController for this request
  const controller = new AbortController();
  setAbortController(controller);

  try {
    // Filter out any assistant messages after the stopped message and retry
    const messageIndex = messages.findIndex(m => m.id === messageId);
    const filteredMessages = messages.slice(0, messageIndex + 1);
    
    // Add delay for testing if message contains "тест задержки"
    const shouldAddDelay = messageToRetry.content.includes('тест задержки');
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: filteredMessages,
        threadId: currentThreadId,
        streamingMode,
        addDelay: shouldAddDelay
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error('Failed to send message');

    if (streamingMode) {
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        // Check if request was aborted
        if (controller.signal.aborted) {
          return;
        }
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
            // Check for abort between lines too
            if (controller.signal.aborted) {
              break;
            }
            
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  assistantMessage += data.content;
                  const newMessages = [...messages];
                  if (newMessages.length === 1 || newMessages[newMessages.length - 1].role !== 'assistant') {
                    assistantMessageId = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    newMessages.push({
                      id: assistantMessageId,
                      role: 'assistant' as const,
                      content: assistantMessage,
                      created_at: new Date().toISOString(),
                    });
                  } else {
                    newMessages[newMessages.length - 1].content = assistantMessage;
                  }
                  setMessages(newMessages);
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
            }
        }
      }
    } else {
      // Handle full response
      const text = await response.text();
      const assistantMessageId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const assistantContent = text;
      const assistantMessageObj: Message = {
        id: assistantMessageId,
        role: 'assistant' as const,
        content: assistantContent,
        created_at: new Date().toISOString(),
      };
      setMessages([...messages, assistantMessageObj]);
      const newLoading: Record<string, boolean> = { ...chatLoading };
      newLoading[currentThreadId!] = false;
      setChatLoading(newLoading);
    }

    await loadThreads();
    if (currentThreadId) {
      await loadMessages(currentThreadId);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    // Always reset chatLoading unless user stopped the process
    if (!wasStopped) {
      const newLoading: Record<string, boolean> = { ...chatLoading };
      newLoading[currentThreadId!] = false;
      setChatLoading(newLoading);
      setWasStopped(true);
      const newStopped: Record<string, string> = { ...stoppedMessageId };
      newStopped[currentThreadId!] = assistantMessageId;
      setStoppedMessageId(newStopped);
    }
    // Reset stopped flag
    setWasStopped(false);
  }
};
