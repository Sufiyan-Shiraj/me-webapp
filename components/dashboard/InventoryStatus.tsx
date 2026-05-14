"use client";

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Package, AlertCircle, XCircle, CheckCircle2 } from 'lucide-react';
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
        <Link href="/inventory" className="block h-full cursor-pointer group/inv">
            <div className="flex flex-col mb-4">
                <h3 className="text-sm font-semibold tracking-tight text-gray-900 uppercase">Stock Inventory</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mt-0.5">
                    {data.totalQuantity.toLocaleString()} Total Units
                </p>
            </div>
            
            <div className="space-y-5">
                <div className="flex items-end justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-success-bg text-success border border-success-border">
                            <CheckCircle2 size={14} />
                        </div>
                        <div>
                            <div className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-success transition-colors">{inStockCount}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">In Stock</div>
                        </div>
                    </div>
                    <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div 
                            className="h-full bg-success-bg0 transition-all duration-1000 ease-out" 
                            style={{ width: getWidth(inStockCount) }}
                        />
                    </div>
                </div>

                <div className="flex items-end justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-warning-bg text-warning border border-warning-border">
                            <AlertCircle size={14} />
                        </div>
                        <div>
                            <div className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-warning transition-colors">{lowStockCount}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Low Stock</div>
                        </div>
                    </div>
                    <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div 
                            className="h-full bg-warning-bg0 transition-all duration-1000 ease-out" 
                            style={{ width: getWidth(lowStockCount) }}
                        />
                    </div>
                </div>

                <div className="flex items-end justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-destructive-bg text-destructive border border-destructive-border">
                            <XCircle size={14} />
                        </div>
                        <div>
                            <div className="text-xl font-bold tracking-tight text-gray-900 group-hover:text-destructive transition-colors">{outOfStockCount}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Out of Stock</div>
                        </div>
                    </div>
                    <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden mb-1">
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
