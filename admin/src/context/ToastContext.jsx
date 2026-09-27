import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Floating Toasts Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          let bgStyle = 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-500/20';
          let Icon = CheckCircle2;

          if (toast.type === 'error') {
            bgStyle = 'bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-500/20';
            Icon = AlertCircle;
          } else if (toast.type === 'warning') {
            bgStyle = 'bg-amber-950/90 border-amber-500/50 text-amber-200 shadow-amber-500/20';
            Icon = AlertTriangle;
          } else if (toast.type === 'info') {
            bgStyle = 'bg-purple-950/90 border-purple-500/50 text-purple-200 shadow-purple-500/20';
            Icon = Info;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3 animate-slide-in transition-all ${bgStyle}`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
