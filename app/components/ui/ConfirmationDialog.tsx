"use client";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  danger?: boolean;
}

export default function ConfirmationDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText, 
  cancelText, 
  danger 
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              danger 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {confirmText}
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
