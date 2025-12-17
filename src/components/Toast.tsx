'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onClose(toast.id), 300);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.id, onClose]);

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bgGradient: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          iconBg: 'bg-green-100 dark:bg-green-900/40',
          iconColor: 'text-green-600 dark:text-green-400',
          textColor: 'text-green-900 dark:text-green-100',
          titleColor: 'text-green-900 dark:text-green-200',
        };
      case 'error':
        return {
          bgGradient: 'from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          iconBg: 'bg-red-100 dark:bg-red-900/40',
          iconColor: 'text-red-600 dark:text-red-400',
          textColor: 'text-red-900 dark:text-red-100',
          titleColor: 'text-red-900 dark:text-red-200',
        };
      case 'warning':
        return {
          bgGradient: 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/40',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          textColor: 'text-yellow-900 dark:text-yellow-100',
          titleColor: 'text-yellow-900 dark:text-yellow-200',
        };
      case 'info':
      default:
        return {
          bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconBg: 'bg-blue-100 dark:bg-blue-900/40',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-900 dark:text-blue-100',
          titleColor: 'text-blue-900 dark:text-blue-200',
        };
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`bg-gradient-to-r ${styles.bgGradient} border-2 ${styles.borderColor} rounded-xl p-4 flex items-start gap-4 transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-96' : 'opacity-100 translate-x-0'
      }`}
    >
      <div className={`${styles.iconBg} p-2 rounded-lg flex-shrink-0`}>
        <div className={styles.iconColor}>{getIcon()}</div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={`font-bold text-sm ${styles.titleColor}`}>{toast.title}</h3>
        {toast.message && (
          <p className={`text-sm mt-1 ${styles.textColor}`}>{toast.message}</p>
        )}
      </div>

      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(toast.id), 300);
        }}
        className={`${styles.iconColor} hover:opacity-70 transition-opacity flex-shrink-0 mt-0.5`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
