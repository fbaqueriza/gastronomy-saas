'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Rutas donde NO mostrar la navegación
  const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password'];
  const isAuthRoute = authRoutes.includes(pathname);
  
  if (isAuthRoute) {
    return null;
  }
  
  return <Navigation />;
} 