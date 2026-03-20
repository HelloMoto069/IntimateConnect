import React, {createContext, useContext, useState, useMemo, useCallback} from 'react';
import {COLORS, GRADIENTS, TYPOGRAPHY, SPACING, BORDER_RADIUS, STORAGE_KEYS} from '@utils/constants';
import {fastStore} from '@utils/encryptionUtils';

const ThemeContext = createContext(null);

export const ThemeProvider = ({children}) => {
  const [isDark, setIsDark] = useState(() => {
    const stored = fastStore.get(STORAGE_KEYS.THEME_MODE);
    return stored ? stored === 'dark' : true; // dark by default
  });

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const newMode = !prev;
      fastStore.set(STORAGE_KEYS.THEME_MODE, newMode ? 'dark' : 'light');
      return newMode;
    });
  }, []);

  const setTheme = useCallback(mode => {
    const dark = mode === 'dark';
    setIsDark(dark);
    fastStore.set(STORAGE_KEYS.THEME_MODE, mode);
  }, []);

  const theme = useMemo(
    () => ({
      colors: isDark ? COLORS.dark : COLORS.light,
      gradients: isDark ? GRADIENTS.dark : GRADIENTS.light,
      typography: TYPOGRAPHY,
      spacing: SPACING,
      borderRadius: BORDER_RADIUS,
    }),
    [isDark],
  );

  const value = useMemo(
    () => ({
      theme,
      isDark,
      toggleTheme,
      setTheme,
    }),
    [theme, isDark, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
