'use client';

import { useState, useEffect } from "react";
import { Message, Thread, Confirmation, ModelSettings } from './types';
import { 
  handleSaveThreadTitle, 
  handleStartEditingThread, 
  handleCancelEditing, 
  handleConfirmAction,
  loadThreads, 
  loadMessages,
  createNewThread, 
  handleInputChange, 
  handleStop,
  handleSubmit, 
  handleRetry
} from './utils';
import { 
  Sidebar,
  MessageList,
  MessageInput,
  SettingsModal,
  ConfirmationDialog 
} from './ui';

export default function ChatInterface() {
  const [threads, setThreads] = useState<any[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [chatLoading, setChatLoading] = useState<Record<string, boolean>>({});
  const [streamingMode, setStreamingMode] = useState(true);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [stoppedMessageId, setStoppedMessageId] = useState<Record<string, string>>({});
  const [retryCount, setRetryCount] = useState<Record<string, number>>({});
  const [wasStopped, setWasStopped] = useState(false);
  const [confirmation, setConfirmation] = useState<{ type: string; id: string } | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [currentModel, setCurrentModel] = useState("Ollama");
  const [showSettings, setShowSettings] = useState(false);

  const handleSaveThreadTitleLocal = async (): Promise<void> => {
    await handleSaveThreadTitle(
      editingThreadId,
      editingTitle,
      setEditingThreadId,
      setEditingTitle,
      () => loadThreads(setThreads)
    );
  };

  const handleStartEditingThreadLocal = (threadId: string, currentTitle: string): void => {
    handleStartEditingThread(threadId, currentTitle, setEditingThreadId, setEditingTitle);
  };

  const handleCancelEditingLocal = (): void => {
    handleCancelEditing(setEditingThreadId, setEditingTitle);
  };

  const handleConfirmActionLocal = async (): Promise<void> => {
    await handleConfirmAction(
      confirmation,
      currentThreadId,
      setMessages,
      setCurrentThreadId,
      setConfirmation,
      () => loadThreads(setThreads)
    );
  };

  const handleSubmitLocal = async (e: React.FormEvent): Promise<void> => {
    await handleSubmit(
      e,
      input,
      setInput,
      currentThreadId,
      setCurrentThreadId,
      messages,
      setMessages,
      chatLoading,
      setChatLoading,
      setAbortController,
      setWasStopped,
      streamingMode,
      () => loadThreads(setThreads),
      (threadId: string) => loadMessages(threadId, setMessages),
      wasStopped,
      currentModel,
      modelSettings,
      stoppedMessageId,
      setStoppedMessageId
    );
  };
  const [modelSettings, setModelSettings] = useState({
    ollama: { url: "http://localhost:11434", model: "llama2:7b" },
    openai: { apiKey: "", model: "gpt-4" }
  });

  // Helper functions - defined before useEffects
  const loadThreadsLocal = async (): Promise<void> => {
    await loadThreads(setThreads);
  };

  const loadMessagesLocal = async (threadId: string): Promise<void> => {
    await loadMessages(threadId, setMessages);
  };

  // Load threads and settings on component mount
  useEffect(() => {
    loadThreadsLocal();
    
    // Load model settings from localStorage
    const savedSettings = localStorage.getItem('modelSettings');
    if (savedSettings) {
      try {
        setModelSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading model settings:', error);
      }
    }
  }, []);

  // Load messages when thread changes (but not for new threads that already have messages in state)
  useEffect(() => {
    if (currentThreadId) {
      const loadMessagesAsync = async () => {
        // Check if this is a new thread (just created) or an existing thread
        const isNewThread = !threads.find(t => t.id === currentThreadId);
        
        // Only load from database for existing threads
        // For new threads, preserve messages already in state
        if (!isNewThread) {
          await loadMessages(currentThreadId, setMessages);
        }
      };
      
      loadMessagesAsync();
    }
  }, [currentThreadId, threads]);

  // Save model settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('modelSettings', JSON.stringify(modelSettings));
  }, [modelSettings]);

  const createNewThreadLocal = async (): Promise<void> => {
    await createNewThread(
      setCurrentThreadId,
      setMessages,
      loadThreadsLocal
    );
  };

  const handleInputChangeLocal = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    handleInputChange(e, setInput);
  };

  const handleStopLocal = (): void => {
    handleStop(
      abortController,
      setAbortController,
      setWasStopped,
      chatLoading,
      setChatLoading,
      wasStopped,
      messages,
      currentThreadId,
      stoppedMessageId,
      setStoppedMessageId,
      retryCount,
      setRetryCount
    );
  };

  const handleRetryLocal = async (messageId: string): Promise<void> => {
    await handleRetry(
      messageId,
      currentThreadId,
      messages,
      chatLoading,
      setMessages,
      setChatLoading,
      setAbortController,
      setWasStopped,
      setStoppedMessageId,
      stoppedMessageId,
      streamingMode,
      loadThreadsLocal,
      loadMessagesLocal,
      wasStopped
    );
  };

  const renderMainContent = () => {
    if (!currentThreadId && threads.length > 0) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Добро пожаловать в AI Чат</h1>
            <p className="text-gray-600 mb-6">Выберите чат слева или создайте новый, чтобы начать общение</p>
            <button
              onClick={createNewThreadLocal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Начать новый чат
            </button>
          </div>
        </div>
      );
    } else if (currentThreadId) {
      return (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">AI Чат</h1>
              <div className="flex items-center gap-2">
                <select
                  value={currentModel}
                  onChange={(e) => setCurrentModel(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Ollama">Ollama</option>
                  <option value="OpenAI">OpenAI</option>
                </select>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4">
            <MessageList
              messages={messages}
              chatLoading={chatLoading}
              stoppedMessageId={stoppedMessageId}
              retryCount={retryCount}
              onRetry={handleRetryLocal}
            />
          </div>

          {/* Input */}
          <MessageInput
            input={input}
            isStreaming={Object.values(chatLoading).some(Boolean)}
            onInputChange={(e) => setInput(e.target.value)}
            onSubmit={handleSubmitLocal}
            onStop={handleStopLocal}
          />
        </div>
      );
    } else {
      // Welcome screen or new thread
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Добро пожаловать в AI Чат</h1>
            <p className="text-gray-600 mb-6">Создайте новый чат, чтобы начать общение</p>
            <button
              onClick={createNewThreadLocal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Начать новый чат
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-screen bg-gray-50 w-full overflow-hidden">
      <Sidebar
        threads={threads}
        currentThreadId={currentThreadId}
        searchQuery={searchQuery}
        editingThreadId={editingThreadId}
        editingTitle={editingTitle}
        onThreadClick={(threadId) => {
          setCurrentThreadId(threadId);
          loadMessagesLocal(threadId);
        }}
        onNewThread={createNewThreadLocal}
        onSearchChange={setSearchQuery}
        onStartEditing={handleStartEditingThreadLocal}
        onSaveEdit={handleSaveThreadTitleLocal}
        onCancelEdit={handleCancelEditingLocal}
        onDeleteThread={(threadId) => setConfirmation({ type: 'deleteThread', id: threadId })}
        onSettingsClick={() => setShowSettings(true)}
      />

      {renderMainContent()}

      {/* Modals */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        modelSettings={modelSettings}
        onModelSettingsChange={setModelSettings}
        currentModel={currentModel}
        onModelChange={setCurrentModel}
        streamingMode={streamingMode}
        onStreamingModeChange={setStreamingMode}
      />

      <ConfirmationDialog
        isOpen={!!confirmation}
        onClose={() => setConfirmation(null)}
        onConfirm={handleConfirmActionLocal}
        title="Подтверждение"
        message={
          confirmation?.type === 'deleteThread'
            ? 'Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.'
            : 'Вы уверены, что хотите выполнить это действие?'
        }
        confirmText="Удалить"
        cancelText="Отмена"
        danger={confirmation?.type === 'deleteThread'}
      />
    </div>
  );
}
