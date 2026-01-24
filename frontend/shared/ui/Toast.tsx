'use client';

import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Toast as ToastType, useToastStore } from '@/shared/lib/toast.store';

interface ToastProps {
  toast: ToastType;
}

export function Toast({ toast }: ToastProps) {
  const removeToast = useToastStore((state) => state.removeToast);

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-success/10',
      borderColor: 'border-success',
      textColor: 'text-success',
      iconColor: 'text-success',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-danger/10',
      borderColor: 'border-danger',
      textColor: 'text-danger',
      iconColor: 'text-danger',
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning',
      textColor: 'text-warning',
      iconColor: 'text-warning',
    },
    info: {
      icon: Info,
      bgColor: 'bg-terracotta/10',
      borderColor: 'border-terracotta',
      textColor: 'text-terracotta',
      iconColor: 'text-terracotta',
    },
  };

  const config = typeConfig[toast.type];
  const Icon = config.icon;

  return (
    <div
      className={`
        ${config.bgColor}
        ${config.borderColor}
        border-l-4
        rounded-lg
        p-4
        shadow-medium
        flex
        items-start
        gap-3
        min-w-[320px]
        max-w-[480px]
        animate-slide-in-right
      `}
      role="alert"
    >
      <Icon className={`${config.iconColor} shrink-0 w-5 h-5 mt-0.5`} />
      <div className="flex-1">
        <p className={`${config.textColor} font-medium text-sm`}>{toast.message}</p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className={`
          ${config.textColor}
          hover:opacity-70
          transition-opacity
          shrink-0
        `}
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-23 right-4 z-50 flex flex-col gap-3 pointer-events-none"
      style={{ pointerEvents: 'none' }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  );
}
