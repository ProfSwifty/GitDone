import React, { createContext, useState, useEffect, useContext } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase.config';

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  const signUp = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);
  const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return <AuthContext.Provider value={{ user, signUp, login, logout }}>{children}</AuthContext.Provider>;
};