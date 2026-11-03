import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let borderClass = 'border-blue-500/20 bg-white dark:bg-slate-900';
        let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-red-500/30 bg-red-50/90 dark:bg-red-950/40 text-red-950 dark:text-red-100';
          icon = <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-premium backdrop-blur-md transition-all duration-300 animate-fade-in ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-tight leading-5">{toast.title}</h4>
              {toast.message && (
                <p className="mt-1 text-xs opacity-90 leading-relaxed font-normal">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

