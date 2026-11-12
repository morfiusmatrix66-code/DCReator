import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Проверяем localStorage или системную настройку при первой загрузке
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dc_theme');
      if (saved) return saved;
      
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    // Применяем тему к document.documentElement
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
}