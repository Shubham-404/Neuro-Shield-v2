// components/ui/toast.jsx
import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

const ToastContext = React.createContext({ add: () => { } });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const add = (t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => dismiss(id), t.duration ?? 3000);
  };
  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  React.useEffect(() => {
    const handler = (e) => add(e.detail || {});
    window.addEventListener('toast', handler);
    return () => window.removeEventListener('toast', handler);
  }, []);

  return (
    <ToastContext.Provider value={{ add, dismiss }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-100 space-y-2 rounded-md bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-xl">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                'card p-4 shadow-lg min-w-[260px] border',
                t.variant === 'destructive'
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : t.variant === 'success'
                    ? 'border-green-200 bg-green-50 text-green-600'
                    : 'border-slate-200 bg-white'
              )}
            >
              <div className="font-medium">{t.title}</div>
              {t.description && <div className="text-sm mt-1">{t.description}</div>}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => React.useContext(ToastContext);