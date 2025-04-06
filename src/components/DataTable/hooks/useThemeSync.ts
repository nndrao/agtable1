import { useState, useEffect, useRef, useCallback } from "react";

interface UseThemeSyncProps {
  isDark?: boolean;
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
}

export function useThemeSync({ isDark, onThemeChange }: UseThemeSyncProps) {
  // Use a ref to track the latest isDark prop value
  const isDarkRef = useRef(isDark);
  const [darkMode, setDarkMode] = useState(isDark);
  const [themeReady, setThemeReady] = useState(false);

  // Keep isDarkRef updated with the latest prop value and sync with AG-Grid
  useEffect(() => {
    isDarkRef.current = isDark;
    if (isDark !== darkMode) {
      setDarkMode(isDark);
      // Set AG Grid theme mode globally
      document.body.dataset.agThemeMode = isDark ? "dark" : "light";
    }
  }, [isDark, darkMode]);

  // Handle theme changes
  const handleThemeChange = useCallback((theme: "light" | "dark" | "system") => {
    // Determine if the theme should be dark based on selected theme
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const newDarkMode = theme === "dark" || (theme === "system" && systemPrefersDark);

    // Update internal state - this will trigger the useEffect to update AG Grid
    setDarkMode(newDarkMode);

    // Call parent callback with the new theme
    if (onThemeChange) {
      onThemeChange(theme);
    }
  }, [onThemeChange]);

  // Update when system theme preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only update if we're not explicitly set by props
      if (isDark === undefined) {
        const newDarkMode = e.matches;
        setDarkMode(newDarkMode);
        // Update AG-Grid theme
        document.body.dataset.agThemeMode = newDarkMode ? "dark" : "light";
        // Notify parent if needed
        if (onThemeChange) {
          onThemeChange(newDarkMode ? "dark" : "light");
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [isDark, onThemeChange]);

  // Set up AG Grid theme mode
  useEffect(() => {
    // Set AG Grid theme mode globally
    document.body.dataset.agThemeMode = darkMode ? "dark" : "light";
    setThemeReady(true);
  }, [darkMode]);

  return {
    darkMode,
    themeReady,
    handleThemeChange
  };
}
