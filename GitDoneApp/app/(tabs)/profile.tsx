// app/(tabs)/profile.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isDarkMode } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: logout },
      ]
    );
  };

  const sectionTextColor = isDarkMode ? '#CCCCCC' : '#666';

  return (
    <ThemedView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, isDarkMode && styles.avatarDark]}>
          <ThemedText style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </ThemedText>
        </View>
        <ThemedText type="title" style={styles.name}>{user?.email}</ThemedText>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color="#FF3B30" />
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedText style={[styles.version, { color: sectionTextColor }]}>
        App Version 1.0.0
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarDark: {
    backgroundColor: '#2C5282',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  name: {
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 15,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  version: {
    textAlign: 'center',
    marginTop: 'auto',
    paddingVertical: 20,
  },
});