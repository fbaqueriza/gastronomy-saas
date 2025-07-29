import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SupabaseAuthProvider } from '../hooks/useSupabaseAuth';
import { ChatProvider } from '../contexts/ChatContext';
import Navigation from '../components/Navigation';
import WhatsAppSync from '../components/WhatsAppSync';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gastronomy Manager',
  description: 'SaaS app for gastronomy commerce managers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseAuthProvider>
          <ChatProvider>
            <WhatsAppSync />
            <Navigation />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
          </ChatProvider>
        </SupabaseAuthProvider>
      </body>
    </html>
  );
} 
