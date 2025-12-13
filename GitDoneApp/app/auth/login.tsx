import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error Logging In', 'Please enter Login details.');
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/cat.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>GitDone Login</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <View style={{ marginTop: 40 }}>
      <Button  title="Login" onPress={handleLogin} />
      </View>
      <View style={{ marginTop: 20 }}>
      <Button title="Sign Up" onPress={() => router.push('/auth/signup')} />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  logo: { width: 200, height: 200, alignSelf: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 10, borderRadius: 5 },     
});