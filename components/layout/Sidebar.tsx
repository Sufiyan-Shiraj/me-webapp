"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ShieldCheck } from 'lucide-react';
import { navItems } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';
// Inline styles for simplicity or could use modules. keeping inline/tailwind-like with globals.

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { logout, user } = useAuth(); // User might be null initially



    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={clsx(
                "fixed left-0 top-0 h-screen z-30 transition-transform duration-500 cubic-bezier(0.25, 1, 0.5, 1) w-64 p-4",
                "md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Floating Glass Container */}
                <div className="h-full flex flex-col rounded-2xl bg-[var(--surface-dark)] backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden relative">
                    {/* Subtle internal glow */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div className="h-20 flex items-center px-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg shadow-primary/40">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-base tracking-wide text-white">SIMS <span className="text-primary">PRO</span></span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Enterprise</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto py-6 px-4">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-3">Main Menu</div>
                        <nav className="space-y-1">
                            {navItems.filter(item => {
                                if (item.name === 'Analytics' || item.name === 'Users') {
                                    return user?.role === 'admin';
                                }
                                return true;
                            }).map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={clsx(
                                        'group flex items-center px-3 py-3 text-sm rounded-xl transition-all duration-300 relative overflow-hidden',
                                        isActive(item.href)
                                            ? 'text-white font-medium'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    )}
                                >
                                    {isActive(item.href) && (
                                        <div className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl" />
                                    )}
                                    <item.icon
                                        className={clsx(
                                            'mr-3 flex-shrink-0 transition-all duration-300',
                                            isActive(item.href) ? 'text-primary drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'text-gray-500 group-hover:text-gray-300'
                                        )}
                                        size={18}
                                    />
                                    <span className="relative z-10">{item.name}</span>
                                    {isActive(item.href) && (
                                        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(6,182,212,1)]" />
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 mt-auto">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 mb-3 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold border border-white/10">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                                    <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center justify-center px-4 py-2.5 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5"
                        >
                            <LogOut className="mr-2" size={14} />
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
