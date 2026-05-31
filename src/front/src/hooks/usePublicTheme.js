import { useCallback, useEffect, useState } from 'react';

export const PUB_THEME_STORAGE_KEY = 'ctrlfleet-pub-theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';

  const saved = localStorage.getItem(PUB_THEME_STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') return saved;

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function usePublicTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(PUB_THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
    isLight: theme === 'light',
    isDark: theme === 'dark',
  };
}
