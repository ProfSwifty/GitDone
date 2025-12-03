import { StyleSheet, Button, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/AuthContext';
import {  Redirect } from 'expo-router';

export default function HomeScreen() {
  const { user, logout } = useAuth();

 
   if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome to GitDone!</ThemedText>
      <ThemedText>{user.email}</ThemedText>
      <ThemedText style={styles.placeholder}>Your tasks will go here</ThemedText>
      <Button title="Logout" onPress={logout} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholder: {
    color: '#999',
    marginVertical: 20,
  },
});