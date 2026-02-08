import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import type { Toast as ToastType, ToastType as ToastVariant } from '../../store/toastStore';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const toastConfig: Record<ToastVariant, {
  icon: typeof CheckCircle;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
}> = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    textColor: 'text-green-800',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    textColor: 'text-red-800',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-800',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-500',
    textColor: 'text-amber-800',
  },
};

export function Toast({ toast, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 10);

    // Trigger exit animation before removal
    const duration = toast.duration ?? 4000;
    const exitTimer = setTimeout(() => {
      setIsLeaving(true);
    }, duration - 300);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [toast.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${config.bgColor} ${config.borderColor}
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
        }
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
      <p className={`text-sm font-medium ${config.textColor}`}>
        {toast.message}
      </p>
      <button
        onClick={handleRemove}
        aria-label="Benachrichtigung schließen"
        className={`
          ml-auto p-1 rounded-md transition-colors
          hover:bg-black/5 active:bg-black/10
          ${config.textColor}
        `}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
