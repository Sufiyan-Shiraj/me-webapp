import React from 'react';
import type { Metadata } from 'next';
import SalesSummary from '@/components/dashboard/SalesSummary';
import InventoryStatus from '@/components/dashboard/InventoryStatus';
import LowStockAlerts from '@/components/dashboard/LowStockAlerts';
import SecurityBanner from '@/components/auth/SecurityBanner';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import DashboardActions from '@/components/dashboard/DashboardActions';

export const metadata: Metadata = {
    title: 'Dashboard - Sales & Inventory Manager',
};

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-sans font-bold tracking-tight text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-2">Dashboard</h1>
                    <p className="text-gray-400">Overview of your business performance.</p>
                </div>
                <DashboardActions />
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
                <SecurityBanner />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <SalesSummary />
                </div>
                <div>
                    <InventoryStatus />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <LowStockAlerts />
            </div>
        </div>
    );
}
