"use client";

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    IndianRupee,
    TrendingUp,
    Download,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Package
} from 'lucide-react';
import clsx from 'clsx';
import styles from '@/components/ui/ui.module.css';

export default function SalesSummary() {
    return (
        <Card className="h-full bg-surface backdrop-blur-xl border border-border shadow-glass">
            <CardHeader className="border-border">
                <h3 className="text-sm font-semibold tracking-tight text-foreground uppercase">Sales Overview</h3>
                <Button variant="ghost" size="sm" icon={Download}>Report</Button>
            </CardHeader>
            <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Revenue Card */}
                    <div className="p-5 rounded-xl border border-white/5 bg-black/20 backdrop-blur-sm group hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <IndianRupee size={16} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-white mb-1">₹24,50,000</div>
                        <div className="flex items-center gap-1.5 text-xs text-success font-medium bg-success/5 py-1 px-2 rounded-lg w-fit">
                            <TrendingUp size={12} /> +12.5% <span className="text-gray-500 font-normal ml-1">vs last month</span>
                        </div>
                    </div>

                    {/* Transactions Card */}
                    <div className="p-5 rounded-xl border border-white/5 bg-black/20 backdrop-blur-sm group hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                            <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                                <CreditCard size={16} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Transactions</span>
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-white mb-1">1,204</div>
                        <div className="flex items-center gap-1.5 text-xs text-success font-medium bg-success/5 py-1 px-2 rounded-lg w-fit">
                            <ArrowUpRight size={12} /> +5.2% <span className="text-gray-500 font-normal ml-1">vs last month</span>
                        </div>
                    </div>

                    {/* Average Order Card */}
                    <div className="p-5 rounded-xl border border-white/5 bg-black/20 backdrop-blur-sm group hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                                <Package size={16} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Average Order</span>
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-white mb-1">₹8,432</div>
                        <div className="flex items-center gap-1.5 text-xs text-destructive font-medium bg-destructive/5 py-1 px-2 rounded-lg w-fit">
                            <ArrowDownRight size={12} /> -1.2% <span className="text-gray-500 font-normal ml-1">vs last month</span>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
