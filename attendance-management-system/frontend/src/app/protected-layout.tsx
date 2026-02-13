// src/app/protected-layout.tsx
'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      setShowContent(true);
    }
  }, [isLoggedIn, router]);

  if (!showContent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // For authenticated routes, wrap content with sidebar for navigation
  return <Sidebar>{children}</Sidebar>;
}