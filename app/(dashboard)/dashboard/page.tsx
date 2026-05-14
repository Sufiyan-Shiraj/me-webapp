import React from 'react';
import type { Metadata } from 'next';
import TransactionSummary from '@/components/dashboard/SalesSummary';
import InventoryStatus from '@/components/dashboard/InventoryStatus';
import LowStockAlerts from '@/components/dashboard/LowStockAlerts';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DashboardActions from '@/components/dashboard/DashboardActions';
import { getDashboardStats } from '@/lib/actions/dashboardActions';
import { getRecentActivity } from '@/lib/actions/activityActions';

export const metadata: Metadata = {
    title: 'Dashboard - Sales & Inventory Manager',
};

export default async function DashboardPage() {
    // Fetch data server-side
    const stats = await getDashboardStats();
    const activities = await getRecentActivity();

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-sans font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">
                        Operational Dashboard
                    </h1>
                    <p className="text-gray-400">Real-time overview of business operations.</p>
                </div>
                <DashboardActions />
            </div>

            {/* Top Row: Quick Stats & Transaction Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TransactionSummary 
                        transactionCount={stats.salesCount} 
                        customerCount={stats.customerCount}
                    />
                </div>
                <div>
                    <InventoryStatus data={stats.inventory} />
                </div>
            </div>

            {/* Bottom Row: Activity Feed & Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RecentActivity activities={activities} />
                </div>
                <div className="space-y-6">
                    <LowStockAlerts alerts={stats.inventory.lowStockItems} />
                </div>
            </div>
        </div>
    );
}
