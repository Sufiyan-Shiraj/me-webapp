"use client";

import React from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { TrendingUp, ShoppingBag, Truck } from 'lucide-react';

import TransactionSummary from '@/components/dashboard/SalesSummary';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DashboardActions from '@/components/dashboard/DashboardActions';
import ActiveOrdersOverview from '@/components/dashboard/ActiveOrdersOverview';
import { getDashboardStats, getPendingOrdersOverview } from '@/lib/actions/dashboardActions';
import { getRecentActivity } from '@/lib/actions/activityActions';

const fetcher = async () => {
    return Promise.all([
        getDashboardStats(),
        getRecentActivity(),
        getPendingOrdersOverview()
    ]);
};

export default function DashboardClient() {
    const { data, isLoading, error } = useSWR('dashboardData', fetcher, { 
        refreshInterval: 30000, // 30 seconds
        revalidateOnFocus: true
    });

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500 pb-10">
                {/* Header Skeleton */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border/50">
                    <div>
                        <div className="h-9 w-48 bg-accent/10 rounded-lg animate-pulse"></div>
                        <div className="h-5 w-64 bg-accent/5 rounded-md animate-pulse mt-2"></div>
                    </div>
                    <div className="flex gap-3">
                        <div className="h-10 w-24 bg-accent/10 rounded-xl animate-pulse"></div>
                        <div className="h-10 w-32 bg-accent/10 rounded-xl animate-pulse"></div>
                    </div>
                </div>

                {/* Hero Stats Banner Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row min-h-[160px]">
                        <div className="flex-1 p-6 border-b sm:border-b-0 sm:border-r border-border/50">
                            <div className="h-5 w-24 bg-accent/10 rounded-md animate-pulse mb-6"></div>
                            <div className="h-12 w-20 bg-accent/10 rounded-lg animate-pulse"></div>
                        </div>
                        <div className="flex-1 p-6">
                            <div className="h-5 w-32 bg-accent/10 rounded-md animate-pulse mb-6"></div>
                            <div className="h-12 w-20 bg-accent/10 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                    <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm min-h-[160px]">
                        <div className="flex justify-between items-center mb-6">
                            <div className="h-5 w-32 bg-accent/10 rounded-md animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="h-10 w-full bg-accent/10 rounded-lg animate-pulse"></div>
                            <div className="h-10 w-full bg-accent/10 rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Main Content Split Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-surface rounded-2xl border border-border shadow-sm min-h-[500px] p-6">
                        <div className="h-6 w-48 bg-accent/10 rounded-md animate-pulse mb-4"></div>
                        <div className="h-32 w-full bg-accent/5 rounded-xl animate-pulse mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-16 w-full bg-accent/5 rounded-xl animate-pulse"></div>
                            <div className="h-16 w-full bg-accent/5 rounded-xl animate-pulse"></div>
                            <div className="h-16 w-full bg-accent/5 rounded-xl animate-pulse"></div>
                        </div>
                    </div>
                    <div className="bg-surface rounded-2xl p-6 border border-border shadow-sm h-[600px]">
                        <div className="h-6 w-32 bg-accent/10 rounded-md animate-pulse mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="h-10 w-10 bg-accent/10 rounded-full animate-pulse shrink-0"></div>
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 w-3/4 bg-accent/10 rounded-md animate-pulse"></div>
                                        <div className="h-3 w-1/2 bg-accent/5 rounded-md animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-10 text-center">
                <h3 className="text-xl font-bold text-destructive">Failed to load dashboard data</h3>
                <p className="text-foreground/60 mt-2">Please try refreshing the page.</p>
            </div>
        );
    }

    const [stats, activities, pendingOrders] = data || [null, null, null];

    if (!stats) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border/50">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/60">Overview</h1>
                    <p className="text-sm text-foreground/60 mt-1 font-medium tracking-wide">Here's a summary of your store's performance today.</p>
                </div>
                <DashboardActions />
            </div>

            {/* Unified Hero Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative overflow-hidden bg-gradient-to-br from-surface to-accent/[0.02] rounded-2xl border border-border shadow-float flex flex-col sm:flex-row min-h-[160px]">
                    {/* Left: Total Orders */}
                    <Link href="/orders" className="flex-1 p-6 relative flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-border/50 group hover:bg-accent/[0.02] transition-colors cursor-pointer">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-accent/10 blur-2xl group-hover:bg-accent/20 transition-colors duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold tracking-wide text-foreground/60 uppercase">Total Orders</h3>
                                <div className="p-2 rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                                    <ShoppingBag size={18} className="stroke-[2]" />
                                </div>
                            </div>
                            <div className="flex items-end gap-3">
                                <h2 className="text-5xl font-black tracking-tight text-foreground">{stats.orderCount.toLocaleString()}</h2>
                            </div>
                        </div>
                    </Link>

                    {/* Right: Total Shipments */}
                    <Link href="/sales" className="flex-1 p-6 relative flex flex-col justify-between group hover:bg-accent/[0.02] transition-colors cursor-pointer">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-accent/10 blur-2xl group-hover:bg-accent/20 transition-colors duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold tracking-wide text-foreground/60 uppercase">Total Shipments</h3>
                                <div className="p-2 rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                                    <Truck size={18} className="stroke-[2]" />
                                </div>
                            </div>
                            <div className="flex items-end gap-3">
                                <h2 className="text-5xl font-black tracking-tight text-foreground">{stats.salesCount.toLocaleString()}</h2>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="relative group overflow-hidden bg-gradient-to-br from-surface to-accent/[0.02] rounded-2xl p-6 border border-border shadow-float min-h-[160px]">
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-accent/5 blur-2xl group-hover:bg-accent/10 transition-colors duration-500" />
                    <div className="relative z-10 h-full">
                        <TransactionSummary
                            transactionCount={stats.salesCount}
                            customerCount={stats.customerCount}
                            unitsSold={stats.totalUnitsSold}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Active Orders Overview (Takes 2 columns) */}
                <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-b from-surface to-background/50 rounded-2xl border border-border shadow-float">
                    <ActiveOrdersOverview initialItems={pendingOrders} />
                </div>

                {/* Right Side: Recent Activity (Takes 1 column) */}
                <div className="relative overflow-hidden bg-gradient-to-b from-surface to-background/50 rounded-2xl p-6 border border-border shadow-float flex flex-col h-[600px] overflow-y-auto custom-scrollbar">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl opacity-50 pointer-events-none" />
                    <div className="relative z-10 h-full">
                        <RecentActivity activities={activities} />
                    </div>
                </div>
            </div>
        </div>
    );
}
