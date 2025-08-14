'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Rutas donde NO mostrar la navegación
  const authRoutes = ['/auth/login', '/auth/signup', '/auth/forgot-password'];
  const isAuthRoute = authRoutes.includes(pathname);
  
  // No mostrar navegación en la página principal (landing page)
  const isLandingPage = pathname === '/';
  
  // Filtrar rutas de Next.js internas
  const isNextInternalRoute = pathname.includes('_next') || 
                             pathname.includes('.well-known') || 
                             pathname.includes('static');
  
  if (isAuthRoute || isLandingPage || isNextInternalRoute) {
    return null;
  }
  
  return <Navigation />;
} 