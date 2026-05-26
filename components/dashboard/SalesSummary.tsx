"use client";

import React, { useState } from 'react';
import { Package, Users, BarChart2 } from 'lucide-react';
import { CustomerModal } from './CustomerModal';
import Link from 'next/link';

interface TransactionSummaryProps {
    transactionCount: number;
    customerCount: number;
    unitsSold: number;
}

export default function TransactionSummary({ transactionCount, customerCount, unitsSold }: TransactionSummaryProps) {
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const avgItems = transactionCount > 0 ? (unitsSold / transactionCount).toFixed(1) : "0";

    return (
        <div className="h-full flex flex-col justify-between">
            <div className="flex flex-col mb-4">
                <h3 className="text-sm font-semibold tracking-wide text-foreground/60 uppercase">Volume & Activity</h3>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-medium mt-1">
                    Performing • 1h
                </p>
            </div>

            <div className="space-y-3">
                {/* Total Units Sold */}
                <div className="flex items-center justify-between pb-2 border-b border-border/50 group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                            <Package size={16} className="stroke-[1.5]" />
                        </div>
                        <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">Total Units Sold</span>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold tracking-tight text-foreground">{unitsSold.toLocaleString()}</div>
                    </div>
                </div>

                {/* Avg Items Per Sale */}
                <div className="flex items-center justify-between pb-2 border-b border-border/50 group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                            <BarChart2 size={16} className="stroke-[1.5]" />
                        </div>
                        <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">Avg. Units / Sale</span>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold tracking-tight text-foreground">{avgItems}</div>
                    </div>
                </div>

                {/* Customers */}
                <div
                    className="flex items-center justify-between pb-1 group cursor-pointer"
                    onClick={() => setIsCustomerModalOpen(true)}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-info/10 border border-info/20 text-info group-hover:bg-info/20 transition-colors">
                            <Users size={16} className="stroke-[1.5]" />
                        </div>
                        <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">Active Customers</span>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold tracking-tight text-foreground">{customerCount.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <CustomerModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
            />
        </div>
    );
}
