"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ShieldCheck } from 'lucide-react';
import { navItems } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

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
                    className="fixed inset-0 bg-black/40 z-20 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={clsx(
                "fixed left-0 top-0 h-screen z-30 transition-transform duration-500 cubic-bezier(0.25, 1, 0.5, 1) w-64 p-4",
                "md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Floating Container */}
                <div className="h-full flex flex-col rounded-2xl bg-white border border-border shadow-lg overflow-hidden relative">
                    <div className="h-20 flex items-center px-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-sm">
                                <ShieldCheck size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-base tracking-wide text-foreground">SIMS <span className="text-accent">PRO</span></span>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Enterprise</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto py-6 px-4">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Main Menu</div>
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
                                            ? 'text-foreground font-medium bg-accent/5'
                                            : 'text-gray-500 hover:text-foreground hover:bg-gray-50'
                                    )}
                                >
                                    <item.icon
                                        className={clsx(
                                            'mr-3 flex-shrink-0 transition-all duration-300',
                                            isActive(item.href) ? 'text-accent' : 'text-gray-400 group-hover:text-gray-500'
                                        )}
                                        size={18}
                                    />
                                    <span className="relative z-10">{item.name}</span>
                                    {isActive(item.href) && (
                                        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-accent shadow-sm" />
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="p-4 mt-auto space-y-3">
                        {user?.role === 'admin' ? (
                            <Link
                                href="/users"
                                className={clsx(
                                    "block p-4 rounded-xl transition-all duration-300 border group/profile",
                                    isActive('/users')
                                        ? "bg-accent/5 border-accent/20"
                                        : "bg-gray-50 border-border hover:bg-gray-100"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={clsx(
                                        "h-9 w-9 rounded-full flex items-center justify-center font-bold border transition-all duration-300",
                                        isActive('/users') ? "bg-accent border-accent text-white shadow-sm" : "bg-gray-200 border-border text-foreground group-hover/profile:border-accent/30 group-hover/profile:text-accent"
                                    )}>
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-foreground truncate group-hover/profile:text-accent transition-colors">{user?.name}</p>
                                        <p className="text-xs text-gray-500 truncate capitalize">Manage Account</p>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="p-4 rounded-xl bg-gray-50 border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center text-foreground font-bold border border-border">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <button
                            onClick={() => logout()}
                            className="w-full flex items-center justify-center px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-destructive uppercase tracking-wider transition-colors hover:bg-destructive-bg rounded-lg border border-transparent hover:border-destructive-border"
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
