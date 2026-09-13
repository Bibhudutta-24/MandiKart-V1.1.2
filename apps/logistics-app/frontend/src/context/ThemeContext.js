import React, { createContext, useContext, useState, useEffect } from 'react';
import { colors, lightColors, darkColors, applyTheme } from '../theme/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync colors whenever dark mode toggles
  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      applyTheme(next);
      return next;
    });
  };

  const setDarkMode = (value) => {
    applyTheme(value);
    setIsDarkMode(Boolean(value));
  };

  const currentColors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        colors: currentColors,
        toggleDarkMode,
        setDarkMode,
        themeName: isDarkMode ? 'dark' : 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      isDarkMode: false,
      colors: lightColors,
      toggleDarkMode: () => {},
      setDarkMode: () => {},
      themeName: 'light',
    };
  }
  return context;
};

export default ThemeContext;
