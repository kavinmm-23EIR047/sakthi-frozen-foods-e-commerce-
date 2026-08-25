'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-right-8 fade-in ${
              toast.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : toast.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-600" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto p-1 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-4 h-4 opacity-70" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
