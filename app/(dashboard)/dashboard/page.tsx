import React from 'react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

import TransactionSummary from '@/components/dashboard/SalesSummary';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DashboardActions from '@/components/dashboard/DashboardActions';
import ActiveOrdersOverview from '@/components/dashboard/ActiveOrdersOverview';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/actions/dashboardActions';
import { getRecentActivity } from '@/lib/actions/activityActions';
import { TrendingUp, ShoppingBag, Truck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Dashboard - Sales & Inventory Manager',
};

export default async function DashboardPage() {
    const stats = await getDashboardStats();
    const activities = await getRecentActivity();

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
                    <Link href="/shipments" className="flex-1 p-6 relative flex flex-col justify-between group hover:bg-accent/[0.02] transition-colors cursor-pointer">
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-accent/10 blur-2xl group-hover:bg-accent/20 transition-colors duration-500" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold tracking-wide text-foreground/60 uppercase">Total Shipments</h3>
                                <div className="p-2 rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20 group-hover:bg-accent group-hover:text-white transition-colors duration-300">
                                    <Truck size={18} className="stroke-[2]" />
                                </div>
                            </div>
                            <div className="flex items-end gap-3">
                                <h2 className="text-5xl font-black tracking-tight text-foreground">0</h2>
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
                    <ActiveOrdersOverview />
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
