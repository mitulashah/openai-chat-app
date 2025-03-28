import { useState, useEffect } from 'react';
import { themes } from '../theme';

const THEME_STORAGE_KEY = 'app-theme';

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState(themes.light);
  const [currentThemeName, setCurrentThemeName] = useState('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(themes[savedTheme]);
      setCurrentThemeName(savedTheme);
    } else {
      setCurrentTheme(themes.light);
      setCurrentThemeName('light');
    }
  };

  const handleThemeChange = (e, data) => {
    const newThemeName = data.value;
    setCurrentTheme(themes[newThemeName]);
    setCurrentThemeName(newThemeName);
    localStorage.setItem(THEME_STORAGE_KEY, newThemeName);
  };

  return {
    currentTheme,
    currentThemeName,
    handleThemeChange
  };
};