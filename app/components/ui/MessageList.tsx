'use client';

import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  chatLoading: Record<string, boolean>;
  stoppedMessageId: Record<string, string>;
  retryCount: Record<string, number>;
  onRetry: (messageId: string) => void;
}

export default function MessageList({
  messages,
  chatLoading,
  stoppedMessageId,
  retryCount,
  onRetry
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8 px-4">
        Начните диалог. Отправьте сообщение ниже.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-2xl lg:max-w-3xl rounded-lg px-4 py-2 ${
              message.role === 'user'
                ? 'bg-blue-100 text-blue-900 rounded-br-none'
                : 'bg-gray-100 text-gray-900 rounded-bl-none'
            }`}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
            
            {message.role === 'assistant' && (
              <div className="mt-1 flex items-center justify-end space-x-2 text-xs text-gray-500">
                {chatLoading[message.id] && (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Генерация...
                  </span>
                )}
                
                {stoppedMessageId[message.id] && (
                  <button
                    onClick={() => onRetry(message.id)}
                    className="text-blue-500 hover:text-blue-700 flex items-center group relative"
                    title="Повторить генерацию"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      Повторить отправку
                    </span>
                  </button>
                )}
                
                {retryCount[message.id] > 0 && (
                  <span className="text-xs text-gray-500">
                    {retryCount[message.id]} {retryCount[message.id] === 1 ? 'попытка' : retryCount[message.id] < 5 ? 'попытки' : 'попыток'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
