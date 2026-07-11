"use client";

import { useState, createContext, useContext, useCallback } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  addToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const iconMap = {
  success: <CheckCircle size={16} className="text-[var(--admin-gold)]" />,
  error: <XCircle size={16} className="text-[var(--admin-danger)]" />,
  info: <Info size={16} className="text-[var(--admin-info)]" />,
};

const bgMap = {
  success: "border-[var(--admin-gold)]/20",
  error: "border-[var(--admin-danger)]/20",
  info: "border-[var(--admin-info)]/20",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`admin-glass admin-animate-fade-in flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium text-[var(--admin-text)] shadow-xl ${bgMap[toast.type]}`}
          >
            {iconMap[toast.type]}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
