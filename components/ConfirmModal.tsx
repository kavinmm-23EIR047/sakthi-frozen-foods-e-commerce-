'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{title}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
