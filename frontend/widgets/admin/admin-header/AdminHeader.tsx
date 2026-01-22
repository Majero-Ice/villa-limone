'use client';

import { useAuthStore } from '@/features/admin-auth';
import { LogOut } from 'lucide-react';
import { Button } from '@/shared/ui';

export function AdminHeader() {
  const { admin, logout } = useAuthStore();

  return (
    <header className="bg-white border-b border-soft-beige px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-serif text-graphite">Admin Dashboard</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-graphite">{admin?.email}</p>
          <p className="text-xs text-warm-gray">Administrator</p>
        </div>
        
        <Button
          variant="outline"
          onClick={logout}
          className="flex items-center gap-2"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </header>
  );
}
