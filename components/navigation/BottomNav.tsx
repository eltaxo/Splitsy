'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Gasto',
      icon: (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={pathname === '/' ? '#C8FF4D' : '#6B6759'} strokeWidth={pathname === '/' ? '2.2' : '1.8'}/>
          <path d="M12 8.5v7M8.5 12h7" stroke={pathname === '/' ? '#C8FF4D' : '#6B6759'} strokeWidth={pathname === '/' ? '2.2' : '1.8'} strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      href: '/resumen',
      label: 'Resumen',
      icon: (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="3" width="16" height="18" rx="3" stroke={pathname === '/resumen' ? '#C8FF4D' : '#6B6759'} strokeWidth={pathname === '/resumen' ? '2.2' : '1.8'}/>
          <path d="M8 8h8M8 12h8M8 16h4" stroke={pathname === '/resumen' ? '#C8FF4D' : '#6B6759'} strokeWidth={pathname === '/resumen' ? '2.2' : '1.8'} strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      href: '/liquidar',
      label: 'Liquidar',
      icon: (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
          <path d="M4 9h13M17 9l-3.2-3.2M17 9l-3.2 3.2" stroke={pathname === '/liquidar' ? '#C8FF4D' : '#6B6759'} strokeWidth={pathname === '/liquidar' ? '2.2' : '1.8'} strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 15H7M7 15l3.2-3.2M7 15l3.2 3.2" stroke={pathname === '/liquidar' ? '#C8FF4D' : '#6B6759'} strokeWidth={pathname === '/liquidar' ? '2.2' : '1.8'} strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      href: '/perfil',
      label: 'Perfil',
      icon: (
        <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={pathname === '/perfil' ? '#C8FF4D' : '#6B6759'} strokeWidth={pathname === '/perfil' ? '2.2' : '1.8'} strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke={pathname === '/perfil' ? '#C8FF4D' : '#6B6759'} strokeWidth={pathname === '/perfil' ? '2.2' : '1.8'}/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#15140F] border-t border-[#2A2820] z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}>
      <div className="max-w-md mx-auto px-6 py-4">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 w-18"
              >
                {item.icon}
                <span className="text-xs font-bold" style={{ color: isActive ? '#C8FF4D' : '#6B6759' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
