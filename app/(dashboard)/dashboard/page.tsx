import React from 'react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

import TransactionSummary from '@/components/dashboard/SalesSummary';
import InventoryStatus from '@/components/dashboard/InventoryStatus';
import LowStockAlerts from '@/components/dashboard/LowStockAlerts';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DashboardActions from '@/components/dashboard/DashboardActions';
import Link from 'next/link';
import { getDashboardStats } from '@/lib/actions/dashboardActions';
import { getRecentActivity } from '@/lib/actions/activityActions';
import { TrendingUp, Users, ShoppingCart } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Dashboard - Sales & Inventory Manager',
};

export default async function DashboardPage() {
    const stats = await getDashboardStats();
    const activities = await getRecentActivity();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-border/50">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/60">Overview</h1>
                    <p className="text-sm text-foreground/60 mt-1 font-medium tracking-wide">Here's a summary of your store's performance today.</p>
                </div>
                <DashboardActions />
            </div>

            {/* Unified Hero Stats Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/sales" className="relative group overflow-hidden bg-gradient-to-br from-surface to-accent/[0.02] rounded-2xl p-6 border border-border shadow-float transition-all hover:shadow-lg hover:border-accent/30 flex flex-col justify-between min-h-[160px]">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-accent/10 blur-2xl group-hover:bg-accent/20 transition-colors duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold tracking-wide text-foreground/60 uppercase">Total Sales</h3>
                            <div className="p-2 rounded-xl bg-accent/10 text-accent ring-1 ring-accent/20">
                                <ShoppingCart size={18} className="stroke-[2]" />
                            </div>
                        </div>
                        <div className="flex items-end gap-3">
                            <h2 className="text-5xl font-black tracking-tight text-foreground">{stats.salesCount.toLocaleString()}</h2>
                            <span className="mb-1 flex items-center gap-1 text-sm font-bold tracking-wide text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
                                <TrendingUp size={14} /> +12%
                            </span>
                        </div>
                    </div>
                </Link>

                <div className="relative group overflow-hidden bg-gradient-to-br from-surface to-accent/[0.02] rounded-2xl p-6 border border-border shadow-float min-h-[160px]">
                    <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-accent/5 blur-2xl group-hover:bg-accent/10 transition-colors duration-500" />
                    <div className="relative z-10 h-full">
                        <TransactionSummary 
                            transactionCount={stats.salesCount} 
                            customerCount={stats.customerCount}
                        />
                    </div>
                </div>

                <div className="relative group overflow-hidden bg-gradient-to-br from-surface to-accent/[0.02] rounded-2xl p-6 border border-border shadow-float min-h-[160px]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-accent/5 blur-3xl group-hover:bg-accent/10 transition-colors duration-500" />
                    <div className="relative z-10 h-full">
                        <InventoryStatus data={stats.inventory} />
                    </div>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Recent Activity (Takes 2 columns) */}
                <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-b from-surface to-background/50 rounded-2xl p-6 border border-border shadow-float">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl opacity-50" />
                    <div className="relative z-10 h-full">
                        <RecentActivity activities={activities} />
                    </div>
                </div>

                {/* Right Side: Stock Alerts (Takes 1 column) */}
                <div className="relative overflow-hidden bg-gradient-to-b from-surface to-background/50 rounded-2xl p-6 border border-border shadow-float flex flex-col">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-destructive/5 rounded-full blur-3xl opacity-50" />
                    <div className="relative z-10 h-full">
                        <LowStockAlerts alerts={stats.inventory.lowStockItems} />
                    </div>
                </div>
            </div>
        </div>
    );
}
