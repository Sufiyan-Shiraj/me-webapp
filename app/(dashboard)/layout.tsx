"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';
import MobileNav from '@/components/layout/MobileNav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (!user) {
        return null; // Redirecting
    }

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 md:ml-64 min-h-screen transition-all duration-300 flex flex-col pb-24 md:pb-0">
                <div className="p-4 md:p-8 flex-1 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>

            <MobileNav />
        </div>
    );
}
