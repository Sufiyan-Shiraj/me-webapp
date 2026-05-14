"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { Bell, Mail, ChevronDown, LayoutDashboard, Settings, Users } from 'lucide-react';
import clsx from 'clsx';

export default function Topbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [isDarkMode, setIsDarkMode] = React.useState(false);

    React.useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        }
    }, []);

    const toggleTheme = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
    };

    if (!user) return null;

    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
            <div className="flex h-20 items-center px-4 md:px-8 max-w-[1600px] mx-auto">
                <div className="flex items-center gap-3 mr-10">
                    <div className="h-10 w-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                        S
                    </div>
                    <span className="font-bold text-xl tracking-tight text-gray-900">SIMS Enterprise</span>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-2 flex-1">
                    {navItems.filter(item => item.name !== 'User Management' || user?.role === 'admin').map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
                                isActive(item.href)
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Right side actions */}
                <div className="flex items-center gap-6 ml-auto">
                    <div className="hidden lg:flex items-center gap-4 border-r border-gray-200 pr-6">
                        <button 
                            onClick={toggleTheme}
                            className="relative w-14 h-8 flex items-center bg-gray-100 rounded-full p-1 cursor-pointer transition-colors duration-300 hover:bg-gray-200 focus:outline-none"
                            aria-label="Toggle dark mode"
                        >
                            <span className="absolute left-2 flex items-center justify-center text-warning z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                            </span>
                            <span className="absolute right-2 flex items-center justify-center text-gray-400 z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                            </span>
                            <div className={clsx(
                                "w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform duration-300 relative z-20 flex items-center justify-center",
                                isDarkMode ? "translate-x-6" : "translate-x-0"
                            )} />
                        </button>
                    </div>

                    <div className="relative">
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 pl-2"
                        >
                            <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden shadow-sm">
                                <img src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="Profile" className="h-full w-full object-cover" />
                            </div>
                            <div className="hidden sm:flex flex-col items-start text-left">
                                <span className="text-sm font-bold text-gray-900 leading-tight">{user.name}</span>
                                <span className="text-[11px] font-medium text-gray-500">{user.username}</span>
                            </div>
                            <ChevronDown size={16} className="text-gray-500 hidden sm:block ml-1" />
                        </button>
                        
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-100 mb-2">
                                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                </div>
                                <Link href="/users" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>
                                    <Users size={16} /> User Management
                                </Link>
                                <button 
                                    onClick={() => { setIsProfileOpen(false); logout(); }}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive-bg mt-1"
                                >
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
