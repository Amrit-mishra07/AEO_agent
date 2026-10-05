'use client';

import React, { useSyncExternalStore } from 'react';
import { Sun, Moon } from 'lucide-react';

function subscribeTheme(callback) {
  if (typeof window === 'undefined') return () => {};
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', callback);
  window.addEventListener('storage', callback);
  return () => {
    media.removeEventListener('change', callback);
    window.removeEventListener('storage', callback);
  };
}

function getThemeSnapshot() {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme || (
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
}

function getServerThemeSnapshot() {
  return 'light';
}

/**
 * Accessible Theme Toggle Button
 * Synchronizes with document.documentElement.dataset.theme via useSyncExternalStore.
 */
export default function ThemeToggle() {
  const currentTheme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem('theme', nextTheme);
    } catch {
      // Ignore localStorage errors
    }
    // Dispatch storage event to notify other listeners
    window.dispatchEvent(new Event('storage'));
  };

  const isDark = currentTheme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-ghost btn-sm btn-icon"
      aria-label={label}
      title={label}
      style={{
        width: '32px',
        height: '32px',
        color: 'var(--text-2)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isDark ? (
        <Sun size={16} aria-hidden="true" />
      ) : (
        <Moon size={16} aria-hidden="true" />
      )}
    </button>
  );
}
