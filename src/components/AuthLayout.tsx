'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const pathname = usePathname();
  
  // Rutas donde NO mostrar la navegación
  const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password'];
  const isAuthRoute = authRoutes.includes(pathname);
  
  return (
    <>
      {!isAuthRoute && <Navigation />}
      <main className={`${isAuthRoute ? 'min-h-screen' : 'min-h-screen bg-gray-50'}`}>
        {children}
      </main>
    </>
  );
} 