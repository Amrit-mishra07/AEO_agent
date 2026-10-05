'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    // Keep at most 3 visible toasts
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={15} style={{ color: 'var(--good)' }} aria-hidden="true" />;
      case 'error':
        return <AlertCircle size={15} style={{ color: 'var(--bad)' }} aria-hidden="true" />;
      case 'warning':
        return <AlertTriangle size={15} style={{ color: 'var(--warn)' }} aria-hidden="true" />;
      default:
        return <Info size={15} style={{ color: 'var(--accent)' }} aria-hidden="true" />;
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="toast-container"
        aria-live="polite"
        style={{
          position: 'fixed',
          bottom: '1.25rem',
          right: '1.25rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 0.9rem',
              background: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              fontSize: '0.8125rem',
              maxWidth: '360px',
            }}
          >
            {getIcon(t.type)}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss toast"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-3)',
                cursor: 'pointer',
                padding: '2px',
                display: 'inline-flex',
              }}
            >
              <X size={13} aria-hidden="true" />
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
    return {
      success: (m) => console.log('Toast success:', m),
      error: (m) => console.error('Toast error:', m),
      warning: (m) => console.warn('Toast warning:', m),
      info: (m) => console.info('Toast info:', m),
    };
  }
  return context;
}
