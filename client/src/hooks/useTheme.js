import { useState, useEffect, useMemo, useCallback } from 'react';
import { themes } from '../theme';
import { loadTheme, saveTheme } from '../services/storageService';

export const useTheme = () => {
  // Get system preference for color scheme (dark or light)
  const getSystemPreference = useCallback(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }, []);

  // Initialize state with a lazy initializer function to avoid repeated calls to getSystemPreference
  const [currentThemeName, setCurrentThemeName] = useState(() => getSystemPreference());
  
  // Derive currentTheme from currentThemeName using useMemo
  const currentTheme = useMemo(() => themes[currentThemeName] || themes.light, [currentThemeName]);

  // Load saved theme - wrapped in useCallback to avoid recreation on each render
  const loadSavedTheme = useCallback(() => {
    const systemPreference = getSystemPreference();
    const savedTheme = loadTheme(null);
    
    if (savedTheme && themes[savedTheme]) {
      // User has a saved preference, use it
      setCurrentThemeName(savedTheme);
    } else if (systemPreference && themes[systemPreference]) {
      // No saved preference, use system preference
      setCurrentThemeName(systemPreference);
    } else {
      // Fallback to light theme if nothing else works
      setCurrentThemeName('light');
    }
  }, [getSystemPreference]);

  // Handle theme change - wrapped in useCallback to avoid recreation on each render
  const handleThemeChange = useCallback((e, data) => {
    const newThemeName = data.value;
    if (newThemeName === currentThemeName) return;
    
    // Set the theme
    setCurrentThemeName(newThemeName);
    saveTheme(newThemeName);
  }, [currentThemeName]);

  useEffect(() => {
    // Load theme on mount
    loadSavedTheme();
    
    // Add listener for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      // Only update if the user hasn't explicitly chosen a theme
      const savedTheme = loadTheme(null);
      if (savedTheme === null) {
        setCurrentThemeName(newTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [loadSavedTheme]); // Add loadSavedTheme as a dependency

  return {
    currentTheme,
    currentThemeName,
    handleThemeChange
  };
};