"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { ChevronDown, Users, LogOut, Sun, Moon } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Topbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
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

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleTheme = () => {
        // Add transition class to prevent color flashing/epilepsy
        document.documentElement.classList.add('theme-transition');
        
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDarkMode(true);
        }
        
        // Remove class after transition completes
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 400);
    };

    if (!user) return null;

    const isActive = (path: string) => pathname.startsWith(path);

    return (
        <header className="sticky top-4 z-50 w-full px-4 md:px-8 max-w-[1400px] mx-auto transition-colors duration-300">
            <div className="flex h-16 items-center px-4 md:px-6 bg-surface/70 backdrop-blur-2xl border border-border shadow-float rounded-2xl">
                <Link href="/" className="flex items-center gap-3 mr-8 group">
                    <div className="h-8 w-8 bg-gradient-to-br from-accent to-orange-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-accent/20 group-hover:shadow-accent/40 transition-all duration-300 group-hover:scale-105">
                        M
                    </div>
                    <span className="font-bold text-lg tracking-tight text-foreground uppercase transition-colors duration-300 group-hover:text-accent">
                        ME FLOW
                    </span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-1 flex-1">
                    {navItems.filter(item => item.name !== 'User Management' || user?.role === 'admin').map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "relative px-4 py-2.5 text-sm font-medium transition-colors duration-300",
                                    active
                                        ? "text-accent"
                                        : "text-foreground/60 hover:text-foreground"
                                )}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="activeNavIndicator"
                                        className="absolute bottom-0 left-2 right-2 h-[2px] bg-accent"
                                        style={{
                                            boxShadow: '0 -2px 10px rgba(234,88,12,0.4)',
                                            borderRadius: '2px 2px 0 0'
                                        }}
                                        initial={false}
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right side actions */}
                <div className="flex items-center gap-4 ml-auto">
                    <div className="hidden lg:flex items-center pr-4 border-r border-border">
                        <button 
                            onClick={toggleTheme}
                            className="relative w-12 h-6 flex items-center bg-background rounded-full p-1 cursor-pointer transition-colors duration-300 hover:bg-border/50 focus:outline-none shadow-inner border border-border/50"
                            aria-label="Toggle dark mode"
                        >
                            <span className="absolute left-1.5 flex items-center justify-center text-accent z-10">
                                <Sun size={12} className="stroke-[2.5]" />
                            </span>
                            <span className="absolute right-1.5 flex items-center justify-center text-foreground/50 z-10">
                                <Moon size={12} className="stroke-[2.5]" />
                            </span>
                            <motion.div 
                                className="w-4 h-4 bg-surface rounded-full shadow-sm relative z-20 flex items-center justify-center border border-border/50"
                                animate={{ x: isDarkMode ? 24 : 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        </button>
                    </div>

                    <div className="relative" ref={profileRef}>
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 pl-1 group focus:outline-none"
                        >
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="h-8 w-8 rounded-full bg-background overflow-hidden shadow-sm ring-2 ring-transparent group-hover:ring-accent/30 transition-all duration-300"
                            >
                                <img src={`https://ui-avatars.com/api/?name=${user.name}&background=ea580c&color=fff`} alt="Profile" className="h-full w-full object-cover" />
                            </motion.div>
                            <div className="hidden sm:flex flex-col items-start text-left">
                                <span className="text-sm font-semibold text-foreground leading-tight transition-colors duration-300 group-hover:text-accent">{user.name}</span>
                            </div>
                            <motion.div
                                animate={{ rotate: isProfileOpen ? 180 : 0 }}
                                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                                className="hidden sm:block ml-1"
                            >
                                <ChevronDown size={14} className="text-foreground/50 group-hover:text-accent transition-colors duration-300" />
                            </motion.div>
                        </button>
                        
                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className="absolute right-0 mt-4 w-56 bg-surface rounded-2xl shadow-float border border-border py-2 z-50 overflow-hidden"
                                >
                                    <div className="px-4 py-3 border-b border-border mb-2 bg-background/50">
                                        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                                        <p className="text-xs text-foreground/60 capitalize mt-0.5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                                            {user.role}
                                        </p>
                                    </div>
                                    <div className="px-2">
                                        <Link 
                                            href="/users" 
                                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground/80 rounded-xl hover:bg-accent/10 hover:text-accent transition-colors duration-200" 
                                            onClick={() => setIsProfileOpen(false)}
                                        >
                                            <Users size={16} className="stroke-[1.5]" /> User Management
                                        </Link>
                                    </div>
                                    <div className="px-2 mt-1 border-t border-border pt-1">
                                        <button 
                                            onClick={() => { setIsProfileOpen(false); logout(); }}
                                            className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-destructive rounded-xl hover:bg-destructive/10 transition-colors duration-200"
                                        >
                                            <LogOut size={16} className="stroke-[1.5]" /> Log out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}
