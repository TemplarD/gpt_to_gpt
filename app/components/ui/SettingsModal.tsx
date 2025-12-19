'use client';

import { ModelSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelSettings: ModelSettings;
  onModelSettingsChange: (settings: ModelSettings) => void;
  currentModel: string;
  onModelChange: (model: string) => void;
  streamingMode: boolean;
  onStreamingModeChange: (enabled: boolean) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  modelSettings,
  onModelSettingsChange,
  currentModel,
  onModelChange,
  streamingMode,
  onStreamingModeChange
}: SettingsModalProps) {
  if (!isOpen) return null;

  const handleOllamaSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onModelSettingsChange({
      ...modelSettings,
      ollama: {
        ...modelSettings.ollama,
        [name]: value
      }
    });
  };

  const handleOpenAISettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onModelSettingsChange({
      ...modelSettings,
      openai: {
        ...modelSettings.openai,
        [name]: value
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Настройки</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Закрыть настройки"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Модель по умолчанию</h3>
              <select
                value={currentModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Ollama">Ollama</option>
                <option value="OpenAI">OpenAI</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={streamingMode}
                  onChange={(e) => onStreamingModeChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Включить потоковую передачу</span>
              </label>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Настройки Ollama</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL сервера</label>
                  <input
                    type="text"
                    name="url"
                    value={modelSettings.ollama.url}
                    onChange={handleOllamaSettingsChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="http://localhost:11434"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Название модели</label>
                  <input
                    type="text"
                    name="model"
                    value={modelSettings.ollama.model}
                    onChange={handleOllamaSettingsChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="llama3.2"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Настройки OpenAI</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">API ключ</label>
                  <input
                    type="password"
                    name="apiKey"
                    value={modelSettings.openai.apiKey}
                    onChange={handleOpenAISettingsChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="sk-..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Модель</label>
                  <input
                    type="text"
                    name="model"
                    value={modelSettings.openai.model}
                    onChange={handleOpenAISettingsChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="gpt-4"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
