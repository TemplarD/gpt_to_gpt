// Функции для работы с чатом

import { Message } from '../types';

export const createNewThread = async (
  setCurrentThreadId: (id: string | null) => void,
  setMessages: (messages: any[]) => void,
  loadThreads: () => Promise<void>
): Promise<void> => {
  const newThreadId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  setCurrentThreadId(newThreadId);
  setMessages([]);
  
  try {
    // Create thread in database
    const response = await fetch('/api/database/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: newThreadId, 
        title: 'Новый чат',
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create thread');
    }
    
    await loadThreads();
  } catch (error) {
    console.error('Error creating thread:', error);
    // Reset state if creation failed
    setCurrentThreadId(null);
  }
};

export const handleInputChange = (
  e: React.ChangeEvent<HTMLTextAreaElement>,
  setInput: (input: string) => void
): void => {
  setInput(e.target.value);
};

export const handleStop = (
  abortController: AbortController | null,
  setAbortController: (controller: AbortController | null) => void,
  setWasStopped: (stopped: boolean) => void,
  chatLoading: Record<string, boolean>,
  setChatLoading: (loading: Record<string, boolean>) => void,
  wasStopped: boolean,
  messages: Message[],
  currentThreadId: string | null,
  stoppedMessageId: Record<string, string>,
  setStoppedMessageId: (stopped: Record<string, string>) => void,
  retryCount: Record<string, number>,
  setRetryCount: (retry: Record<string, number>) => void
): void => {
  // Set flag that user stopped the process
  setWasStopped(true);
  
  // Always try to abort if controller exists
  if (abortController) {
    abortController.abort();
  } 
  setAbortController(null);
  
  // Reset chatLoading for all threads when stopped
  const newLoading: Record<string, boolean> = { ...chatLoading };
  // Reset all loading states to false
  Object.keys(newLoading).forEach(threadId => {
    newLoading[threadId] = false;
  });
  setChatLoading(newLoading);
  
  // Set stopped message ID to the last user message
  if (messages.length > 0 && currentThreadId) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      const messageId = lastMessage.id;
      const newStopped: Record<string, string> = { ...stoppedMessageId };
      newStopped[currentThreadId] = messageId;
      setStoppedMessageId(newStopped);
      
      // Increment retry count
      const newRetryCount: Record<string, number> = { ...retryCount };
      newRetryCount[messageId] = (newRetryCount[messageId] || 0) + 1;
      setRetryCount(newRetryCount);
    }
  }
  
  // Reset loading state for current thread
  if (currentThreadId) {
    const finalLoading: Record<string, boolean> = { ...chatLoading };
    finalLoading[currentThreadId] = false;
    setChatLoading(finalLoading);
  }
};
