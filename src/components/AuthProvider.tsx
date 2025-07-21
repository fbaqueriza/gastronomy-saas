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
    if (typeof window === 'undefined') {
      setLoading(false);
      console.log('AuthProvider - SSR detected, set loading to false');
      return;
    }
    console.log('AuthProvider - Initializing auth state');

    // EMERGENCY FIX: Force completion immediately
    const emergencyTimeout = setTimeout(() => {
      console.log('AuthProvider - Emergency timeout, forcing completion');
      setLoading(false);
    }, 500);

    // CRITICAL FIX: Force completion immediately to prevent infinite loading
    const immediateTimeout = setTimeout(() => {
      console.log('AuthProvider - Immediate timeout, forcing completion');
      setLoading(false);
    }, 1000);

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('AuthProvider - Loading timeout, setting loading to false');
      setLoading(false);
    }, 2000); // Reduced timeout

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      console.log('AuthProvider - Auth state changed:', firebaseUser);
      clearTimeout(timeout);
      clearTimeout(immediateTimeout);
      clearTimeout(emergencyTimeout);
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

    // Additional fallback: force completion after 1.5 seconds
    const fallbackTimeout = setTimeout(() => {
      if (loading) {
        console.log('AuthProvider - Fallback timeout, forcing completion');
        setLoading(false);
      }
    }, 1500);

    // Add a hard fallback to always clear loading after 3 seconds
    const hardFallback = setTimeout(() => {
      console.log('AuthProvider - Hard fallback, forcing loading=false');
      setLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(immediateTimeout);
      clearTimeout(emergencyTimeout);
      clearTimeout(fallbackTimeout);
      clearTimeout(hardFallback);
      unsubscribe();
    };
  }, [loading]);

  console.log('AuthProvider - Current state:', { user, firebaseUser, loading });

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
 