// Функции для загрузки данных

export const loadThreads = async (setThreads: (threads: any[]) => void): Promise<void> => {
  try {
    const response = await fetch('/api/database/threads');
    if (!response.ok) {
      throw new Error('Failed to load threads');
    }
    const data = await response.json();
    setThreads(data || []);
  } catch (error) {
    console.error('Error loading threads:', error);
    setThreads([]);
  }
};

export const loadMessages = async (
  threadId: string,
  setMessages: (messages: any[]) => void
): Promise<void> => {
  try {
    const response = await fetch(`/api/database/messages?threadId=${threadId}`);
    if (!response.ok) {
      throw new Error('Failed to load messages');
    }
    const data = await response.json();
    if (setMessages && typeof setMessages === 'function') {
      setMessages(data || []);
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    if (setMessages && typeof setMessages === 'function') {
      setMessages([]);
    }
  }
};
