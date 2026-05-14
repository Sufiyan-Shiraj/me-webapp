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
    return (
        <div className="h-full">
            <div className="flex flex-col mb-4">
                <div className="flex items-center justify-between w-full">
                    <h3 className="text-sm font-semibold tracking-tight text-gray-900 uppercase">Stock Alerts</h3>
                    <Link href="/inventory" className="text-[10px] font-bold text-gray-500 hover:text-gray-900 uppercase tracking-widest transition-colors">
                        View All
                    </Link>
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mt-0.5">
                    Needs Attention
                </p>
            </div>

            {alerts.length === 0 ? (
                <div className="py-4 text-center flex flex-col items-center gap-3">
                    <div className="p-3 rounded-full bg-gray-50 text-gray-400 border border-gray-100">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700">No Inventory Alerts</p>
                        <p className="text-xs text-gray-500 mt-1">All items are well-stocked.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {alerts.map((item) => (
                        <div key={item.id} className="flex items-center justify-between pb-3 border-b border-gray-100 last:border-0 last:pb-0 group">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-1.5 rounded-md ${item.stock <= 0 ? 'bg-destructive-bg text-destructive' : 'bg-warning-bg text-warning'}`}>
                                    <AlertTriangle size={14} />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-info transition-colors truncate">
                                        {item.name}
                                    </p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                                        Threshold: {item.threshold}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 pl-2">
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${item.stock <= 0 ? 'text-destructive' : 'text-warning'}`}>
                                        {item.stock <= 0 ? 'Out' : item.stock}
                                    </p>
                                </div>
                                <Link href={`/inventory?search=${encodeURIComponent(item.name)}`}>
                                    <button className="h-7 w-7 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors">
                                        <ArrowRight size={14} />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
