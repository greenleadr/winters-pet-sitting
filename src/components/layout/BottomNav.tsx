'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UsersIcon, CalendarIcon } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/clients', label: 'Clients', icon: UsersIcon },
  { href: '/calendar', label: 'Calendar', icon: CalendarIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-stretch h-16 max-w-screen-sm mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
                active ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className={clsx('h-5 w-5', active && 'text-emerald-600')} strokeWidth={active ? 2.5 : 1.75} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
