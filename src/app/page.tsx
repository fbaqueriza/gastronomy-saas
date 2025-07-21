'use client';

import { useAuth } from '../components/AuthProvider';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    console.log('HomePage - User:', user);
    console.log('HomePage - Loading:', loading);

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('HomePage - Loading timeout, redirecting to login');
        router.push('/auth/login');
      }
    }, 2000);

    if (!loading) {
      clearTimeout(timeout);
      if (user) {
        console.log('HomePage - Redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('HomePage - Redirecting to login');
        router.push('/auth/login');
      }
    }

    return () => clearTimeout(timeout);
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
      </div>
    </div>
  );
}
