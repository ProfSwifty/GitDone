import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider } from '../context/AuthContext';
import { ListsProvider } from '../context/ListsContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { requestNotificationPermissions, setupNotificationChannels } from '../utils/notifications';

export const unstable_settings = {
  anchor: 'splash',
};

/** Root layout component that wraps all providers and navigation */
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

/** Main app component that sets up navigation and initializes notifications */
function ThemedApp() {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    requestNotificationPermissions();
    setupNotificationChannels();
  }, []);

  return (
    <NavigationThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: 'Login' }} />
        <Stack.Screen name="auth/signup" options={{ title: 'Sign Up' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}