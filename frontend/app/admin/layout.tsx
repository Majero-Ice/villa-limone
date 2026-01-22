'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/widgets/admin';
import { useAuthStore } from '@/features/admin-auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, checkAuth, token } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsChecking(false);
      return;
    }

    const verifyAuth = async () => {
      if (!token) {
        router.push('/admin/login');
        setIsChecking(false);
        return;
      }

      try {
        await checkAuth();
        setIsChecking(false);
        
        if (!isAuthenticated) {
          router.push('/admin/login');
        }
      } catch (error) {
        router.push('/admin/login');
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [pathname, token, checkAuth, router, isAuthenticated]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-warm-gray">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
