import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBtJa63_wIWTZw6XbjVScz_zaKKb4wWxAM",
  authDomain: "gitdone-5d0e5.firebaseapp.com",
  projectId: "gitdone-5d0e5",
  storageBucket: "gitdone-5d0e5.firebasestorage.app",
  messagingSenderId: "522165202560",
  appId: "1:522165202560:web:5bd85fb07cdef787334065",
  measurementId: "G-QQ3V4VJXY1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);