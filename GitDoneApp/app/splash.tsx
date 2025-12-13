import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

/** Splash screen displayed on app launch with team and product information */
export default function SplashScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, router]);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff' },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.teamName, { color: isDarkMode ? '#ECEDEE' : '#11181C' }]}>
          /Git:Done
        </Text>
        <Text style={[styles.productName, { color: isDarkMode ? '#ECEDEE' : '#11181C' }]}>
          GitDoneApp
        </Text>
        <Text style={[styles.date, { color: isDarkMode ? '#999' : '#666' }]}>
          {currentDate}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  teamName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  productName: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  date: {
    fontSize: 16,
    fontStyle: 'italic',
  },
});
