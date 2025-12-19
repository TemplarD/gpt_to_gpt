// Функции для работы с потоками (threads)

export const handleSaveThreadTitle = async (
  editingThreadId: string | null,
  editingTitle: string,
  setEditingThreadId: (id: string | null) => void,
  setEditingTitle: (title: string) => void,
  loadThreads: () => Promise<void>
): Promise<void> => {
  if (!editingThreadId || !editingTitle.trim()) return;
  
  try {
    const response = await fetch('/api/database/threads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingThreadId,
        title: editingTitle.trim(),
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update thread title');
    }
    
    await loadThreads();
    setEditingThreadId(null);
    setEditingTitle("");
  } catch (error) {
    console.error('Error updating thread title:', error);
  }
};

export const handleStartEditingThread = (
  threadId: string,
  currentTitle: string,
  setEditingThreadId: (id: string | null) => void,
  setEditingTitle: (title: string) => void
): void => {
  setEditingThreadId(threadId);
  setEditingTitle(currentTitle);
};

export const handleCancelEditing = (
  setEditingThreadId: (id: string | null) => void,
  setEditingTitle: (title: string) => void
): void => {
  setEditingThreadId(null);
  setEditingTitle("");
};

export const handleConfirmAction = async (
  confirmation: { type: string; id: string } | null,
  currentThreadId: string | null,
  setMessages: (messages: any[]) => void,
  setCurrentThreadId: (id: string | null) => void,
  setConfirmation: (confirmation: { type: string; id: string } | null) => void,
  loadThreads: () => Promise<void>
): Promise<void> => {
  if (!confirmation || confirmation.type !== 'deleteThread') return;
  
  try {
    const response = await fetch(`/api/database/threads?id=${confirmation.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete thread');
    }
    
    await loadThreads();
    
    // If we deleted the current thread, reset to a new thread
    if (confirmation.id === currentThreadId) {
      setCurrentThreadId(null);
      setMessages([]);
    }
    
    setConfirmation(null);
  } catch (error) {
    console.error('Error deleting thread:', error);
  }
};
