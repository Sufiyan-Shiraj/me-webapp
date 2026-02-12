"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import { Select } from '@/components/ui/Select';
import { Download, TrendingUp, Calendar } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AnalyticsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [timeRange, setTimeRange] = useState('7d');
    const [salesData, setSalesData] = useState<any[]>([]);
    const [kpiStats, setKpiStats] = useState([
        { label: 'Total Sales', value: '1,204', change: '+5.2%', trend: 'up' },
        { label: 'Active Customers', value: '320', change: '+8.4%', trend: 'up' },
    ]);

    React.useEffect(() => {
        if (!isLoading && user?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [user, isLoading, router]);

    if (isLoading || user?.role !== 'admin') {
        return null; // Or a loading spinner
    }

    // Mock Data Generators
    const generateRandomData = (range: string) => {
        const days = range === '7d' ? 7 : range === '30d' ? 12 : 6; // 7 days, 12 sets (approx 30d), 6 months
        const labels = range === '7d'
            ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            : range === '30d'
                ? Array.from({ length: 12 }, (_, i) => `Day ${i * 3 + 1}`)
                : ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];

        return labels.map(label => ({
            label,
            value: Math.floor(Math.random() * 25000) + 10000,
            color: '#06B6D4'
        }));
    };

    const generateRandomKPIs = () => {
        const randomPercent = () => (Math.random() * 15 - 5).toFixed(1);
        const randomValue = (base: number) => Math.floor(base * (0.8 + Math.random() * 0.4)).toLocaleString('en-IN');
        return [
            { label: 'Total Sales', value: randomValue(1200), change: `${randomPercent()}%`, trend: Math.random() > 0.5 ? 'up' : 'down' },
            { label: 'Active Customers', value: randomValue(300), change: `${randomPercent()}%`, trend: Math.random() > 0.5 ? 'up' : 'down' },
        ];
    };

    // Effect to update data on range change
    React.useEffect(() => {
        setSalesData(generateRandomData(timeRange));
        setKpiStats(generateRandomKPIs());
    }, [timeRange]);

    // Mock Data
    const categoryData = [
        { label: 'Electronics', value: 45, color: '#06B6D4' }, // Primary
        { label: 'Accessories', value: 25, color: '#0EA5E9' }, // Accent
        { label: 'Furniture', value: 20, color: '#8B5CF6' },   // Info
        { label: 'Stationery', value: 10, color: '#10B981' }, // Success
    ];

    return (
        <div className="container mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-sans font-bold tracking-tight text-white">Analytics Dashboard</h1>
                    <p className="text-gray-400 mt-1">Deep dive into your business performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-32">
                        <Select
                            options={[
                                { value: '7d', label: 'Last 7 Days' },
                                { value: '30d', label: 'Last 30 Days' },
                                { value: '90d', label: 'Last 3 Months' }
                            ]}
                            value={timeRange}
                            onChange={setTimeRange}
                            placeholder="Time Range"
                        />
                    </div>
                    <Button icon={Download} variant="secondary">Report</Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kpiStats.map((stat, i) => (
                    <Card key={i} className="bg-surface backdrop-blur-xl border border-white/5 shadow-glass group hover:border-primary/20 transition-all">
                        <CardBody className="p-5">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <h4 className="text-2xl font-bold text-white">{stat.value}</h4>
                                <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${stat.trend === 'up' ? 'text-success bg-success/10' : 'text-destructive bg-destructive/10'}`}>
                                    {stat.change}
                                </span>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
                <AnalyticsChart title="Sales Trend (Weekly)" type="bar" data={salesData} />
                <AnalyticsChart title="Sales by Category" type="pie" data={categoryData} />
            </div>

            {/* Additional Section */}
            <Card className="bg-surface backdrop-blur-xl border border-white/5 shadow-glass">
                <CardHeader className="border-b border-white/5 flex flex-row items-center justify-between">
                    <h3 className="text-sm font-semibold tracking-tight text-white uppercase flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" /> Top Performing Products
                    </h3>
                    <Button variant="ghost" size="sm" className="text-primary">View All</Button>
                </CardHeader>
                <CardBody>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-white/5">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Product Name</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3 text-right rounded-r-lg">Sales</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <tr className="group hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">HDPE Granules - Natural</td>
                                    <td className="px-4 py-3 text-gray-400">Polyethylene</td>
                                    <td className="px-4 py-3 text-right text-white">1,240 kg</td>
                                </tr>
                                <tr className="group hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">LDPE Film Grade</td>
                                    <td className="px-4 py-3 text-gray-400">Polyethylene</td>
                                    <td className="px-4 py-3 text-right text-white">850 kg</td>
                                </tr>
                                <tr className="group hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 font-medium text-white">Polypropylene Homopolymer</td>
                                    <td className="px-4 py-3 text-gray-400">Polypropylene</td>
                                    <td className="px-4 py-3 text-right text-white">620 kg</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
