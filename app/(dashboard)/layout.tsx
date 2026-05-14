"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
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
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <Topbar />

            <main className="flex-1 w-full max-w-[1600px] mx-auto transition-all duration-300 flex flex-col pb-24 md:pb-8 pt-6 px-4 md:px-8">
                {children}
            </main>

            <MobileNav />
        </div>
    );
}
