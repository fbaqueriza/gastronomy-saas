'use client';

import { useSupabaseUser } from '../hooks/useSupabaseUser';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, loading } = useSupabaseUser();
  const router = useRouter();
  const [forceRedirect, setForceRedirect] = useState(false);

  useEffect(() => {
    console.log('HomePage - User:', user);
    console.log('HomePage - Loading:', loading);

    // IMMEDIATE redirect - no waiting
    const immediateTimeout = setTimeout(() => {
      console.log('HomePage - Immediate redirect');
      router.push('/auth/login');
    }, 500);

    // Force redirect after 1.5 seconds regardless of auth state
    const forceTimeout = setTimeout(() => {
      console.log('HomePage - Force redirect timeout');
      setForceRedirect(true);
      router.push('/auth/login');
    }, 1500);

    // Normal auth-based redirect
    if (!loading) {
      clearTimeout(immediateTimeout);
      clearTimeout(forceTimeout);
      if (user) {
        console.log('HomePage - Redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('HomePage - Redirecting to login');
        router.push('/auth/login');
      }
    }

    return () => {
      clearTimeout(immediateTimeout);
      clearTimeout(forceTimeout);
    };
  }, [user, loading, router]);

  // Show a simple loading state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Gastronomy Manager...</p>
        <p className="mt-2 text-sm text-gray-500">
          If this takes too long, please refresh the page
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh Page
        </button>
        <button
          onClick={() => router.push('/auth/login')}
          className="mt-2 ml-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
} 
