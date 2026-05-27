"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import { Select } from '@/components/ui/Select';
import { TrendingUp, AlertCircle, Package, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getAnalyticsData } from '@/lib/actions/analyticsActions';
import clsx from 'clsx';

export default function AnalyticsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    
    const [timeRange, setTimeRange] = useState('7d');
    const [dataType, setDataType] = useState<'sales' | 'orders'>('orders');
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [trendData, setTrendData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [topProducts, setTopProducts] = useState<any[]>([]);
    const [kpiStats, setKpiStats] = useState<any[]>([]);

    useEffect(() => {
        if (!isAuthLoading && user?.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [user, isAuthLoading, router]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            
            const result = await getAnalyticsData(timeRange, dataType);
            if (result.success) {
                setTrendData(result.trendData || []);
                setCategoryData(result.categoryData || []);
                setTopProducts(result.topProducts || []);
                setKpiStats(result.kpis || []);
            } else {
                setError(result.error || 'Failed to fetch analytics data');
            }
            
            setIsLoading(false);
        };

        if (user?.role === 'admin') {
            fetchData();
        }
    }, [timeRange, dataType, user]);

    if (isAuthLoading || user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="container mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl font-sans font-bold tracking-tight text-foreground">Analytics Dashboard</h1>
                    <p className="text-foreground/60 mt-1 text-sm font-medium">Deep dive into your business performance and fulfillment metrics.</p>
                </div>
                
                {/* Data Type Tabs */}
                <div className="flex bg-surface/60 backdrop-blur-xl p-1 rounded-xl border border-border self-start lg:self-center shadow-glass relative z-0">
                    <button 
                        onClick={() => setDataType('orders')}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative z-0",
                            dataType === 'orders' ? "text-white" : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                        )}
                    >
                        {dataType === 'orders' && (
                            <motion.div layoutId="activeTab" className="absolute inset-0 bg-primary rounded-lg shadow-md -z-10" />
                        )}
                        <Package size={16} className={dataType === 'orders' ? 'text-white' : ''} />
                        Orders
                    </button>
                    <button 
                        onClick={() => setDataType('sales')}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative z-0",
                            dataType === 'sales' ? "text-white" : "text-foreground/60 hover:text-foreground hover:bg-accent/5"
                        )}
                    >
                        {dataType === 'sales' && (
                            <motion.div layoutId="activeTab" className="absolute inset-0 bg-primary rounded-lg shadow-md -z-10" />
                        )}
                        <Truck size={16} className={dataType === 'sales' ? 'text-white' : ''} />
                        Shipments
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-40">
                        <Select
                            options={[
                                { value: '7d', label: 'Last 7 Days' },
                                { value: '30d', label: 'Last 30 Days' },
                                { value: '90d', label: 'Last 3 Months' },
                                { value: 'all', label: 'All Time' }
                            ]}
                            value={timeRange}
                            onChange={setTimeRange}
                            placeholder="Time Range"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium border border-destructive/20">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-surface/50 backdrop-blur-xl border border-white/5 shadow-glass h-[104px] animate-pulse rounded-2xl" />
                    ))
                ) : (
                    <AnimatePresence mode="wait">
                        {kpiStats.map((stat, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.1, ease: 'easeOut', duration: 0.3 }}
                                key={`${dataType}-${i}`}
                            >
                                <Card className="bg-surface/80 backdrop-blur-xl border border-border shadow-glass group hover:border-primary/40 hover:bg-surface transition-all duration-300 rounded-2xl">
                                    <CardBody className="p-5">
                                        <p className="text-xs font-bold text-foreground/60 uppercase tracking-wider mb-1.5">{stat.label}</p>
                                        <div className="flex items-baseline gap-3">
                                            <h4 className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</h4>
                                            {stat.change && (
                                                <span className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wide">
                                                    {stat.change}
                                                </span>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
                {isLoading ? (
                    <>
                        <div className="bg-surface/50 backdrop-blur-xl border border-white/5 shadow-glass h-full min-h-[400px] animate-pulse rounded-3xl" />
                        <div className="bg-surface/50 backdrop-blur-xl border border-white/5 shadow-glass h-full min-h-[400px] animate-pulse rounded-3xl" />
                    </>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={`trend-${dataType}`}
                            initial={{ opacity: 0, scale: 0.98 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="h-full"
                        >
                            <AnalyticsChart 
                                title={`Volume Trend (${timeRange === '7d' ? 'Weekly' : timeRange === 'all' ? 'All Time' : 'Monthly'})`} 
                                type="bar" 
                                data={trendData} 
                            />
                        </motion.div>
                        <motion.div 
                            key={`cat-${dataType}`}
                            initial={{ opacity: 0, scale: 0.98 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                            className="h-full"
                        >
                            <AnalyticsChart 
                                title="Volume by Category" 
                                type="pie" 
                                data={categoryData} 
                            />
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            {/* Additional Section */}
            <AnimatePresence mode="wait">
                {!isLoading && (
                    <motion.div 
                        key={`table-${dataType}`}
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: 0.3, duration: 0.3 }}
                    >
                        <Card className="bg-surface/90 backdrop-blur-xl border border-border shadow-glass rounded-3xl overflow-hidden">
                            <CardHeader className="border-b border-border flex flex-row items-center justify-between bg-accent/5 px-6 py-4">
                                <h3 className="text-sm font-bold tracking-tight text-foreground uppercase flex items-center gap-2.5">
                                    <TrendingUp size={16} className="text-primary" /> Top Performing Products (by Volume)
                                </h3>
                            </CardHeader>
                            <CardBody className="p-0">
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-foreground/60 uppercase bg-black/5 dark:bg-black/20">
                                            <tr>
                                                <th className="px-6 py-3.5 font-semibold">Product Name</th>
                                                <th className="px-6 py-3.5 font-semibold">Category / Variant</th>
                                                <th className="px-6 py-3.5 font-semibold text-right">Volume {dataType === 'sales' ? 'Sold' : 'Ordered'}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {topProducts.length > 0 ? (
                                                topProducts.map((product, idx) => (
                                                    <tr key={idx} className="group hover:bg-accent/5 transition-colors">
                                                        <td className="px-6 py-3.5 font-medium text-foreground">{product.name}</td>
                                                        <td className="px-6 py-3.5">
                                                            <span className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest bg-accent/5 px-2 py-1 rounded-md">
                                                                {product.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-3.5 text-right font-mono font-bold text-primary">
                                                            {product.quantity.toLocaleString()} <span className="text-foreground/50 font-sans font-medium text-xs">units</span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-12 text-center text-foreground/60 font-medium">
                                                        No products {dataType === 'sales' ? 'sold' : 'ordered'} in this time range.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardBody>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
