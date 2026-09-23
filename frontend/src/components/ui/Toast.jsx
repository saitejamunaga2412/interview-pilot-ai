import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { IconButton } from './IconButton';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, description, variant = 'default', duration = 5000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, description, variant }]);

    if (duration !== Infinity) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((titleOrMsg, variant = 'default') => {
    if (typeof titleOrMsg === 'object' && titleOrMsg !== null) {
      addToast(titleOrMsg);
    } else {
      addToast({ title: titleOrMsg, variant });
    }
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, showToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

const ToastItem = ({ toast, onRemove }) => {
  const variants = {
    default: "bg-surface border-border text-text-primary",
    success: "bg-success-50 border-success-200 text-success-800 dark:bg-success-900/50 dark:border-success-800 dark:text-success-300",
    error: "bg-error-50 border-error-200 text-error-800 dark:bg-error-900/50 dark:border-error-800 dark:text-error-300",
    warning: "bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/50 dark:border-warning-800 dark:text-warning-300",
    info: "bg-info-50 border-info-200 text-info-800 dark:bg-info-900/50 dark:border-info-800 dark:text-info-300",
  };

  const icons = {
    default: null,
    success: <CheckCircle2 className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all mb-4",
        variants[toast.variant]
      )}
      role="alert"
    >
      <div className="flex gap-3 items-start w-full">
        {icons[toast.variant] && <div className="shrink-0 mt-0.5">{icons[toast.variant]}</div>}
        <div className="grid gap-1">
          {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
          {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
        </div>
      </div>
      <IconButton 
        icon={<X className="h-4 w-4" />} 
        onClick={onRemove}
        size="sm"
        className="absolute right-2 top-2 rounded-md p-1 opacity-50 transition-opacity hover:opacity-100"
      />
    </motion.div>
  );
};
