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
        <Link href="/inventory" className="block h-full">
            <Card className="h-full bg-surface backdrop-blur-xl border border-white/5 shadow-glass hover:border-primary/30 transition-all duration-300 cursor-pointer group/inv">
            <CardHeader className="border-b border-white/5">
                <div className="flex flex-col">
                    <h3 className="text-sm font-semibold tracking-tight text-white uppercase">Stock Inventory</h3>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mt-0.5">
                        {data.totalQuantity.toLocaleString()} Total Units
                    </p>
                </div>
                <Package className="text-primary" size={16} />
            </CardHeader>
            <CardBody>
                <div className="space-y-6">
                    <div className="flex items-end justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-success/10 text-success">
                                <CheckCircle2 size={16} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold tracking-tight text-white group-hover:text-success transition-colors">{inStockCount}</div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">In Stock</div>
                            </div>
                        </div>
                        <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-success transition-all duration-1000 ease-out" 
                                style={{ width: getWidth(inStockCount) }}
                            />
                        </div>
                    </div>

                    <div className="flex items-end justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-warning/10 text-warning">
                                <AlertCircle size={16} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold tracking-tight text-white group-hover:text-warning transition-colors">{lowStockCount}</div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Low Stock</div>
                            </div>
                        </div>
                        <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-warning transition-all duration-1000 ease-out" 
                                style={{ width: getWidth(lowStockCount) }}
                            />
                        </div>
                    </div>

                    <div className="flex items-end justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                                <XCircle size={16} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold tracking-tight text-white group-hover:text-destructive transition-colors">{outOfStockCount}</div>
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Out of Stock</div>
                            </div>
                        </div>
                        <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-destructive transition-all duration-1000 ease-out" 
                                style={{ width: getWidth(outOfStockCount) }}
                            />
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    </Link>
    );
}
