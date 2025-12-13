import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Image, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
 
  
  if (password.length < 6) {
    Alert.alert('Error', 'Enter a password of atleast 6 characters.');
    return;
  }
  try {
    await signUp(email, password);
    router.replace('/(tabs)');
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      Alert.alert('Error', 'Account with this email already exists.');
    } else if (error.code === 'auth/invalid-email') {
      Alert.alert('Error', 'Invalid email address.');
    } else {
      Alert.alert('Error', 'Please enter all details.');
    }
    
  }
};

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/cat.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <View style={{ marginTop: 40 }}>
      <Button title="Sign Up" onPress={handleSignUp} />
      </View>
      <View style={{ marginTop: 20 }}>
      <Button title="Back" onPress={() => router.push('/auth/login')} />
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