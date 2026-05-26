"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

// Simple global event bus
const listeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: ToastType = "success") {
  const toast: Toast = { id: `${Date.now()}-${Math.random()}`, type, message };
  listeners.forEach((fn) => fn(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 3500);
  }, []);

  useEffect(() => {
    listeners.push(add);
    return () => {
      const idx = listeners.indexOf(add);
      if (idx !== -1) listeners.splice(idx, 1);
    };
  }, [add]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />,
    error:   <XCircle     className="w-4 h-4 text-red-500 flex-shrink-0" />,
    info:    <Info        className="w-4 h-4 text-blue-500 flex-shrink-0" />,
  };

  const bg: Record<ToastType, string> = {
    success: "border-green-200 bg-white",
    error:   "border-red-200 bg-white",
    info:    "border-blue-200 bg-white",
  };

  return (
    <div className="fixed bottom-20 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border
                      text-sm font-medium text-gray-800 max-w-xs
                      animate-fade-in pointer-events-auto
                      ${bg[t.type]}`}
        >
          {icons[t.type]}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
