import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import * as React from 'react';
import { auth } from '../firebase.config';
const { createContext, useState, useEffect, useContext } = React;

const AuthContext = createContext<any>(null);

/** Hook to access authentication context */
export const useAuth = () => useContext(AuthContext);

/** Provider component that manages user authentication state */
export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  /** Creates a new user account with email and password */
  const signUp = (email: string, password: string) => createUserWithEmailAndPassword(auth, email, password);
  
  /** Logs in an existing user with email and password */
  const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
  
  /** Logs out the current user */
  const logout = () => signOut(auth);

  return <AuthContext.Provider value={{ user, signUp, login, logout }}>{children}</AuthContext.Provider>;
};