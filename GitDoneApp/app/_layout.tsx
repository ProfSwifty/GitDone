// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '../context/AuthContext';
import { ListsProvider } from '../context/ListsContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { requestNotificationPermissions } from '../utils/notifications';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ListsProvider>
          <ThemedApp />
        </ListsProvider>
        <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}

function ThemedApp() {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  return (
    <NavigationThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
        <Stack.Screen name="auth/signup" options={{ title: 'Sign Up' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}