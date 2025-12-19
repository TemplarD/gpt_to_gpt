'use client';

import { useState } from 'react';
import { Thread } from '../types';

interface SidebarProps {
  threads: Thread[];
  currentThreadId: string | null;
  searchQuery: string;
  editingThreadId: string | null;
  editingTitle: string;
  onThreadClick: (threadId: string) => void;
  onNewThread: () => void;
  onSearchChange: (query: string) => void;
  onStartEditing: (threadId: string, title: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteThread: (threadId: string) => void;
  onSettingsClick: () => void;
}

export default function Sidebar({
  threads,
  currentThreadId,
  searchQuery,
  editingThreadId,
  editingTitle,
  onThreadClick,
  onNewThread,
  onSearchChange,
  onStartEditing,
  onSaveEdit,
  onCancelEdit,
  onDeleteThread,
  onSettingsClick
}: SidebarProps) {
  const filteredThreads = threads.filter(thread => 
    thread.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full sm:w-64 bg-white border-r border-gray-200 p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Чаты</h2>
        <button
          onClick={onNewThread}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-800"
          title="Новый чат"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск чатов..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredThreads.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Чаты не найдены</p>
        ) : (
          <ul className="space-y-1">
            {filteredThreads.map((thread) => (
              <li key={thread.id}>
                <div
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                    currentThreadId === thread.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onThreadClick(thread.id)}
                >
                  {editingThreadId === thread.id ? (
                    <div className="flex-1 flex items-center">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => onStartEditing(thread.id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            onSaveEdit();
                          } else if (e.key === 'Escape') {
                            onCancelEdit();
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <span className="flex-1 truncate">{thread.title}</span>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    {editingThreadId === thread.id ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSaveEdit();
                          }}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Сохранить"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancelEdit();
                          }}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Отмена"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartEditing(thread.id, thread.title);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Редактировать"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.793.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteThread(thread.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                      title="Удалить"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="pt-2 mt-4 border-t border-gray-200">
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center justify-between p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
        >
          <span>Настройки</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
