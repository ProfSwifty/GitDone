import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

/** User profile screen with settings and logout functionality */
export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isDarkMode, theme, setTheme } = useTheme();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  /** Shows confirmation alert and logs out user */
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive', 
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          }
        },
      ]
    );
  };

  const sectionTextColor = isDarkMode ? '#CCCCCC' : '#666';

  /** Returns emoji label for current theme */
  const getThemeLabel = () => {
    switch(theme) {
      case 'light': return '☀️ Light';
      case 'dark': return '🌙 Dark';
      case 'system': return '⚙️ System';
      default: return 'System';
    }
  };

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
        <ThemedText style={[styles.sectionTitle, { color: sectionTextColor }]}>
          Settings
        </ThemedText>
        
        <TouchableOpacity 
          style={[styles.settingItem, { borderBottomColor: isDarkMode ? '#444' : '#ddd' }]}
          onPress={() => setThemeModalVisible(true)}
        >
          <View style={styles.settingLeft}>
            <IconSymbol 
              name={isDarkMode ? 'moon.stars' : 'sun.max'} 
              size={20} 
              color={isDarkMode ? '#FFD166' : '#4A90E2'} 
            />
            <ThemedText style={styles.settingText}>Theme</ThemedText>
          </View>
          <View style={styles.settingRight}>
            <ThemedText style={[styles.settingValue, { color: sectionTextColor }]}>
              {getThemeLabel()}
            </ThemedText>
            <IconSymbol name="chevron.right" size={18} color={sectionTextColor} />
          </View>
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

      {/* Theme Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={themeModalVisible}
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title" style={styles.modalTitle}>
                Choose Theme
              </ThemedText>
              <TouchableOpacity onPress={() => setThemeModalVisible(false)}>
                <IconSymbol name="xmark" size={24} color={isDarkMode ? '#ECEDEE' : '#11181C'} />
              </TouchableOpacity>
            </View>

            <View style={styles.themeOptions}>
              {(['light', 'dark', 'system'] as const).map(themeOption => (
                <TouchableOpacity
                  key={themeOption}
                  style={[
                    styles.themeOption,
                    { 
                      backgroundColor: isDarkMode ? '#1F1F1F' : '#f0f0f0',
                      borderWidth: theme === themeOption ? 3 : 1,
                      borderColor: theme === themeOption ? '#4A90E2' : isDarkMode ? '#444' : '#ddd',
                    }
                  ]}
                  onPress={() => {
                    setTheme(themeOption);
                    setThemeModalVisible(false);
                  }}
                >
                  <IconSymbol 
                    name={
                      themeOption === 'light' ? 'sun.max' : 
                      themeOption === 'dark' ? 'moon.stars' : 
                      'gear'
                    } 
                    size={32} 
                    color={
                      themeOption === 'light' ? '#FFD166' :
                      themeOption === 'dark' ? '#4A90E2' :
                      '#50C878'
                    }
                  />
                  <ThemedText style={styles.themeOptionLabel}>
                    {themeOption === 'light' ? 'Light' :
                     themeOption === 'dark' ? 'Dark' :
                     'System'}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: '#4A90E2' }]}
              onPress={() => setThemeModalVisible(false)}
            >
              <ThemedText style={styles.closeButtonText}>Done</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
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
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '500',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    marginBottom: 0,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 30,
    gap: 15,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
  },
  themeOptionLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});