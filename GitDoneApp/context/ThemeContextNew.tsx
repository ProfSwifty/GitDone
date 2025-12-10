import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [userPreference, setUserPreference] = useState<boolean | null>(null);

  // Load user preference on mount
  useEffect(() => {
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem('themePreference');
        if (saved !== null) {
          setUserPreference(saved === 'dark');
          setIsDark(saved === 'dark');
        } else {
          setUserPreference(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    loadPreference();
  }, []);

  const handleSetIsDark = async (value: boolean) => {
    setIsDark(value);
    setUserPreference(value);
    try {
      await AsyncStorage.setItem('themePreference', value ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    handleSetIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark: handleSetIsDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
}
