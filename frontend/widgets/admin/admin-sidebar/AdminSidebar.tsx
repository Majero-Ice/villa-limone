'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, BookOpen, MessageSquare, Settings } from 'lucide-react';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/reservations', label: 'Reservations', icon: Calendar },
  { href: '/admin/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { href: '/admin/chats', label: 'Chats', icon: MessageSquare },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-ivory font-bold">Villa Limone</h1>
        <p className="text-sm text-warm-gray mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-slate-light text-ivory'
                      : 'text-warm-gray hover:bg-slate-light hover:text-ivory'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
