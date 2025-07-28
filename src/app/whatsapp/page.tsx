'use client';

import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';
import Navigation from '../../components/Navigation';
import WhatsAppIntegratedChat from '../../components/WhatsAppIntegratedChat';
import { DataProvider, useData } from '../../components/DataProvider';
import { useRouter } from 'next/navigation';
import { MessageSquare, Plus, Search } from 'lucide-react';

export default function WhatsAppPageWrapper() {
  const { user, loading: authLoading } = useSupabaseAuth();
  const router = useRouter();
  if (!authLoading && !user) {
    if (typeof window !== 'undefined') router.push('/auth/login');
    return null;
  }
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p className="mt-4 text-gray-600">Cargando...</p></div></div>;
  }
  return (
    <DataProvider userEmail={user?.email ?? undefined}>
      <WhatsAppPage />
    </DataProvider>
  );
}

function WhatsAppPage() {
  const { user } = useSupabaseAuth();
  const { providers } = useData();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="px-4 py-6 sm:px-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                WhatsApp Business
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona conversaciones con tus proveedores
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="px-4 sm:px-0">
          <WhatsAppIntegratedChat providers={providers} />
        </div>
      </main>
    </div>
  );
} 