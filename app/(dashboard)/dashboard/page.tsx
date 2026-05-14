import React from 'react';
import type { Metadata } from 'next';
import TransactionSummary from '@/components/dashboard/SalesSummary';
import InventoryStatus from '@/components/dashboard/InventoryStatus';
import LowStockAlerts from '@/components/dashboard/LowStockAlerts';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DashboardActions from '@/components/dashboard/DashboardActions';
import Link from 'next/link';
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Here's what's happening with your store today.</p>
                </div>
                <DashboardActions />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Link href="/sales" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center hover:border-gray-300 transition-all cursor-pointer group">
                    <p className="text-gray-500 text-sm font-semibold tracking-wide uppercase mb-2 group-hover:text-gray-900 transition-colors">Total Sales</p>
                    <h2 className="text-5xl font-bold tracking-tight text-gray-900">{stats.salesCount.toLocaleString()}</h2>
                    <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4">
                        <span className="text-xs text-gray-500 font-medium">Updated just now</span>
                        <span className="px-2 py-1 bg-success-bg text-success text-xs font-bold rounded-lg">+12%</span>
                    </div>
                </Link>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
                    <TransactionSummary 
                        transactionCount={stats.salesCount} 
                        customerCount={stats.customerCount}
                    />
                </div>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <InventoryStatus data={stats.inventory} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Link href="/users" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:border-gray-300 transition-all cursor-pointer block">
                    <RecentActivity activities={activities} />
                </Link>
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <LowStockAlerts alerts={stats.inventory.lowStockItems} />
                </div>
            </div>
        </div>
    );
}
