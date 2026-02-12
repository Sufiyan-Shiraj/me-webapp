"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/config/navigation';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';

export default function MobileNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    // Safety check - don't show if no user (though layout usually handles this)
    if (!user) return null;



    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
            <nav className="flex items-center justify-between px-6 py-3 rounded-2xl bg-[var(--surface-dark)] backdrop-blur-xl border border-white/10 shadow-lg shadow-black/50">
                {navItems.filter(item => item.name !== 'Analytics' || user?.role === 'admin').map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                            'flex flex-col items-center gap-1 transition-all duration-300 relative',
                            isActive(item.href) ? 'text-primary' : 'text-gray-500 hover:text-gray-300'
                        )}
                    >
                        <div className={clsx(
                            'p-2 rounded-xl transition-all duration-300',
                            isActive(item.href) && 'bg-primary/10 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        )}>
                            <item.icon
                                size={20}
                                className={clsx(
                                    'transition-transform duration-300',
                                    isActive(item.href) && 'scale-110'
                                )}
                            />
                        </div>
                        {isActive(item.href) && (
                            <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary shadow-glow" />
                        )}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
