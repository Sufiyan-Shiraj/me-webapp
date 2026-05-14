"use client";

import React from 'react';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface LowStockItem {
    id: string;
    name: string;
    stock: number;
    threshold: number;
}

interface LowStockAlertsProps {
    alerts: LowStockItem[];
}

export default function LowStockAlerts({ alerts }: LowStockAlertsProps) {
    if (alerts.length === 0) {
        return (
            <Card className="bg-surface backdrop-blur-xl border border-white/5 shadow-glass">
                <CardBody className="p-8 text-center flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-white/5 text-gray-500">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-300">No Inventory Alerts</p>
                        <p className="text-xs text-gray-500 mt-1">All items are either well-stocked or your inventory is empty.</p>
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card className="bg-surface backdrop-blur-xl border border-white/5 shadow-glass">
            <CardHeader className="border-b border-white/5">
                <h3 className="text-sm font-semibold tracking-tight text-white uppercase flex items-center gap-2">
                    <AlertTriangle className="text-warning" size={16} /> Stock Alerts
                </h3>
                <Link href="/inventory">
                    <Button variant="ghost" size="sm" className="text-xs text-primary">View All</Button>
                </Link>
            </CardHeader>
            <CardBody>
                <div className="divide-y divide-white/5">
                    {alerts.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-200 group-hover:text-primary transition-colors truncate">
                                    {item.name}
                                </p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                                    Threshold: {item.threshold}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${item.stock <= 0 ? 'text-destructive' : 'text-warning'}`}>
                                        {item.stock <= 0 ? 'Out of Stock' : `${item.stock} left`}
                                    </p>
                                </div>
                                <Link href={`/inventory?search=${encodeURIComponent(item.name)}`}>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg">
                                        <ArrowRight size={16} />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
