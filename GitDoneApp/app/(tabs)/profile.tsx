// app/(tabs)/profile.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, setTheme, isDarkMode } = useTheme();
  const [notifications, setNotifications] = useState(true);

  // Load saved preferences
  useEffect(() => {
    loadPreferences();
  }, []);

  // Update dark mode when theme changes
  useEffect(() => {
    // Theme is now managed by ThemeContext
  }, [isDarkMode]);

  const loadPreferences = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notifications');
      if (savedNotifications !== null) {
        setNotifications(savedNotifications === 'true');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark' | 'system');
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotifications(value);
    try {
      await AsyncStorage.setItem('notifications', value.toString());
    } catch (error) {
      console.error('Error saving notifications preference:', error);
    }
  };

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

  // Determine icon colors based on theme
  const iconColor = isDarkMode ? '#CCCCCC' : '#666';
  const sectionTextColor = isDarkMode ? '#CCCCCC' : '#666';
  const borderColor = isDarkMode ? '#333' : '#E0E0E0';

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
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: sectionTextColor }]}>
          Settings
        </ThemedText>
        
        <View style={[styles.settingItem, { borderBottomColor: borderColor }]}>
          <View style={styles.settingLeft}>
            <IconSymbol name="paintbrush.fill" size={24} color={iconColor} />
            <ThemedText style={[styles.settingText, { color: sectionTextColor }]}>
              Theme
            </ThemedText>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              onPress={() => handleThemeChange('light')}
              style={[
                styles.themeOption, 
                theme === 'light' && styles.themeOptionActive,
                { backgroundColor: theme === 'light' ? '#4A90E2' : (isDarkMode ? '#2a2a2a' : '#f0f0f0') }
              ]}
            >
              <ThemedText style={[
                styles.themeOptionText,
                theme === 'light' && styles.themeOptionTextActive
              ]}>
                Light
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleThemeChange('dark')}
              style={[
                styles.themeOption, 
                theme === 'dark' && styles.themeOptionActive,
                { backgroundColor: theme === 'dark' ? '#4A90E2' : (isDarkMode ? '#2a2a2a' : '#f0f0f0') }
              ]}
            >
              <ThemedText style={[
                styles.themeOptionText,
                theme === 'dark' && styles.themeOptionTextActive
              ]}>
                Dark
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleThemeChange('system')}
              style={[
                styles.themeOption, 
                theme === 'system' && styles.themeOptionActive,
                { backgroundColor: theme === 'system' ? '#4A90E2' : (isDarkMode ? '#2a2a2a' : '#f0f0f0') }
              ]}
            >
              <ThemedText style={[
                styles.themeOptionText,
                theme === 'system' && styles.themeOptionTextActive
              ]}>
                System
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.settingItem, { borderBottomColor: borderColor }]}>
          <View style={styles.settingLeft}>
            <IconSymbol name="bell.fill" size={24} color={iconColor} />
            <ThemedText style={[styles.settingText, { color: sectionTextColor }]}>
              Notifications
            </ThemedText>
          </View>
          <Switch 
            value={notifications} 
            onValueChange={handleNotificationsToggle}
            trackColor={{ false: '#767577', true: '#4A90E2' }}
            thumbColor={notifications ? '#fff' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={[styles.settingItem, { borderBottomColor: borderColor }]}>
          <View style={styles.settingLeft}>
            <IconSymbol name="person.crop.circle" size={24} color={iconColor} />
            <ThemedText style={[styles.settingText, { color: sectionTextColor }]}>
              Edit Profile
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={20} color={iconColor} />
        </TouchableOpacity>
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
  themeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  themeOptionActive: {
    backgroundColor: '#4A90E2',
  },
  themeOptionText: {
    fontSize: 12,
    color: '#666',
  },
  themeOptionTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});