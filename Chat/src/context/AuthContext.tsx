import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/firebase/config';
import type { User } from '@/types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Create or update user document in Firestore
  const createUserDocument = async (user: FirebaseUser) => {
    const userRef = doc(db, 'users', user.uid);
    const userData: Partial<User> = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      isOnline: true,
      lastSeen: new Date()
    };
    
    await setDoc(userRef, userData, { merge: true });
  };

  // Update online status
  const updateOnlineStatus = async (userId: string, isOnline: boolean) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isOnline,
      lastSeen: serverTimestamp()
    });
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await createUserDocument(user);
        
        // Listen to user data changes
        const userRef = doc(db, 'users', user.uid);
        const userUnsubscribe = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as User);
          }
        });

        // Set online status
        await updateOnlineStatus(user.uid, true);

        // Handle window unload
        const handleBeforeUnload = () => {
          updateOnlineStatus(user.uid, false);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
          userUnsubscribe();
          window.removeEventListener('beforeunload', handleBeforeUnload);
        };
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName });
    await createUserDocument(user);
  };

  const signInWithGoogle = async () => {
    const { user } = await signInWithPopup(auth, googleProvider);
    await createUserDocument(user);
  };

  const logout = async () => {
    if (currentUser) {
      await updateOnlineStatus(currentUser.uid, false);
    }
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, data);
      
      if (data.displayName) {
        await updateProfile(currentUser, { displayName: data.displayName });
      }
      if (data.photoURL) {
        await updateProfile(currentUser, { photoURL: data.photoURL });
      }
    }
  };

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
    
