'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: any | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider - Initializing auth state');

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('AuthProvider - Loading timeout, setting loading to false');
      setLoading(false);
    }, 3000);

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      console.log('AuthProvider - Auth state changed:', firebaseUser);
      clearTimeout(timeout);
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Convert Firebase user to our User type
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name:
            firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          role: 'editor', // Default role, can be fetched from Firestore
          createdAt: new Date(
            firebaseUser.metadata?.creationTime || Date.now(),
          ),
          updatedAt: new Date(),
        };
        console.log('AuthProvider - Setting user data:', userData);
        setUser(userData);
      } else {
        console.log('AuthProvider - No user, setting to null');
        setUser(null);
      }

      setLoading(false);
    });

    // Force an initial check
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('AuthProvider - Found current user:', currentUser);
      const userData: User = {
        id: currentUser.uid,
        email: currentUser.email || '',
        name:
          currentUser.displayName || currentUser.email?.split('@')[0] || '',
        role: 'editor',
        createdAt: new Date(
          currentUser.metadata?.creationTime || Date.now(),
        ),
        updatedAt: new Date(),
      };
      setUser(userData);
      setFirebaseUser(currentUser);
      setLoading(false);
    }

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  console.log('AuthProvider - Current state:', { user, firebaseUser, loading });

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
