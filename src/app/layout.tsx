import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../components/AuthProvider';
import I18nProvider from '../components/I18nProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gastronomy Manager',
  description: 'Bilingual SaaS app for gastronomy commerce managers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <I18nProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">{children}</div>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
