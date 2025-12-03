import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
  if (password.length < 6) {
    Alert.alert('Error', 'Password must be at least 6 characters');
    return;
  }
  try {
    await signUp(email, password);
    router.replace('/(tabs)');
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <View style={{ marginTop: 40 }}>
      <Button title="Sign Up" onPress={handleSignUp} />
      </View>
      <View style={{ marginTop: 20 }}>
      <Button title="Login" onPress={() => router.push('/auth/login')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 10, borderRadius: 5 },
});