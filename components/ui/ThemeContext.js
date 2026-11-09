'use client';

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  toggleTheme: () => {},
});

function getClientTheme() {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('deye_theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function subscribeToTheme(callback) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    media.removeEventListener('change', callback);
  };
}

export function ThemeProvider({ children }) {
  // Safe client-side subscription without triggering setState in useEffect
  const currentTheme = useSyncExternalStore(subscribeToTheme, getClientTheme, () => 'dark');
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('deye_theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
