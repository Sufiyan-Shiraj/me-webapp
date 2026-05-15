"use client";

import React from 'react';
import { AlertTriangle, ArrowRight, Package } from 'lucide-react';
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
        <div className="h-full flex flex-col">
            <div className="flex flex-col mb-4">
                <div className="flex items-center justify-between w-full">
                    <h3 className="text-sm font-semibold tracking-wide text-foreground/60 uppercase">Stock Alerts</h3>
                    <Link href="/inventory" className="text-[10px] font-bold text-accent hover:text-accent/80 uppercase tracking-widest transition-colors">
                        View All
                    </Link>
                </div>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-medium mt-1">
                    Needs Attention
                </p>
            </div>

            {alerts.length === 0 ? (
                <div className="py-8 flex-1 flex flex-col items-center justify-center gap-3">
                    <div className="p-4 rounded-full bg-success/10 text-success border border-success/20">
                        <Package size={32} className="stroke-[1.5]" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-foreground/80">No Alerts</p>
                        <p className="text-xs text-foreground/50 mt-1">All items are well-stocked.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3 flex-1">
                    {alerts.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background/50 hover:bg-background transition-colors group">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-2 rounded-xl ${item.stock <= 0 ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                                    <AlertTriangle size={16} className="stroke-[1.5]" />
                                </div>
                                <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-sm font-semibold text-foreground/90 group-hover:text-foreground transition-colors truncate">
                                        {item.name}
                                    </p>
                                    <p className="text-[10px] text-foreground/50 uppercase tracking-wider font-medium">
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
                                    <button className="h-8 w-8 flex items-center justify-center bg-surface border border-border hover:bg-border/50 rounded-lg text-foreground/50 hover:text-foreground transition-all duration-200">
                                        <ArrowRight size={14} className="stroke-[2]" />
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
