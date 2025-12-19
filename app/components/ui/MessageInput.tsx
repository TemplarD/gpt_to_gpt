'use client';

interface MessageInputProps {
  input: string;
  isStreaming: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStop: () => void;
}

export default function MessageInput({
  input,
  isStreaming,
  onInputChange,
  onSubmit,
  onStop
}: MessageInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as any);
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-2 sm:p-4">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-center gap-2">
        <div className="relative flex-1 w-full">
          <textarea
            value={input}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Введите сообщение..."
            disabled={isStreaming}
            rows={1}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => {
              // TODO: Add attachment functionality
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            Стоп
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className={`px-4 py-2 rounded-full transition-colors flex items-center gap-1 ${
              input.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
            Отправить
          </button>
        )}
      </form>
      
      <p className="text-xs text-gray-500 text-center mt-2">
        Нажмите Enter для отправки, Shift+Enter для новой строки
      </p>
    </div>
  );
}
