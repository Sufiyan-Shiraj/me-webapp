"use client";

import React from 'react';
import { AlertCircle, XCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface InventoryStatusProps {
    data: {
        totalItems: number;
        inStockCount: number;
        lowStockCount: number;
        outOfStockCount: number;
        totalQuantity: number;
    }
}

export default function InventoryStatus({ data }: InventoryStatusProps) {
    const { totalItems, inStockCount, lowStockCount, outOfStockCount } = data;

    const getWidth = (count: number) => {
        if (totalItems === 0) return '0%';
        return `${(count / totalItems) * 100}%`;
    };

    return (
        <Link href="/inventory" className="flex flex-col h-full justify-between cursor-pointer group/inv">
            <div className="flex flex-col mb-4">
                <h3 className="text-sm font-semibold tracking-wide text-foreground/60 uppercase">Stock Inventory</h3>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-medium mt-1">
                    {data.totalQuantity.toLocaleString()} Total Units
                </p>
            </div>
            
            <div className="space-y-5">
                <div className="flex items-end justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-success/10 text-success border border-success/20 group-hover:bg-success/20 transition-colors">
                            <CheckCircle2 size={16} className="stroke-[1.5]" />
                        </div>
                        <div>
                            <div className="text-xl font-bold tracking-tight text-foreground">{inStockCount}</div>
                            <div className="text-[10px] text-foreground/60 font-semibold uppercase tracking-wider">In Stock</div>
                        </div>
                    </div>
                    <div className="h-1.5 w-24 bg-border/50 rounded-full overflow-hidden mb-1.5 shadow-inner">
                        <div 
                            className="h-full bg-success transition-all duration-1000 ease-out" 
                            style={{ width: getWidth(inStockCount) }}
                        />
                    </div>
                </div>

                <div className="flex items-end justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-warning/10 text-warning border border-warning/20 group-hover:bg-warning/20 transition-colors">
                            <AlertCircle size={16} className="stroke-[1.5]" />
                        </div>
                        <div>
                            <div className="text-xl font-bold tracking-tight text-foreground">{lowStockCount}</div>
                            <div className="text-[10px] text-foreground/60 font-semibold uppercase tracking-wider">Low Stock</div>
                        </div>
                    </div>
                    <div className="h-1.5 w-24 bg-border/50 rounded-full overflow-hidden mb-1.5 shadow-inner">
                        <div 
                            className="h-full bg-warning transition-all duration-1000 ease-out" 
                            style={{ width: getWidth(lowStockCount) }}
                        />
                    </div>
                </div>

                <div className="flex items-end justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 group-hover:bg-destructive/20 transition-colors">
                            <XCircle size={16} className="stroke-[1.5]" />
                        </div>
                        <div>
                            <div className="text-xl font-bold tracking-tight text-foreground">{outOfStockCount}</div>
                            <div className="text-[10px] text-foreground/60 font-semibold uppercase tracking-wider">Out of Stock</div>
                        </div>
                    </div>
                    <div className="h-1.5 w-24 bg-border/50 rounded-full overflow-hidden mb-1.5 shadow-inner">
                        <div 
                            className="h-full bg-destructive transition-all duration-1000 ease-out" 
                            style={{ width: getWidth(outOfStockCount) }}
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}
