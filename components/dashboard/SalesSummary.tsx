"use client";

import React from 'react';
import { ShoppingCart, Users } from 'lucide-react';

interface TransactionSummaryProps {
    transactionCount: number;
    customerCount: number;
}

export default function TransactionSummary({ transactionCount, customerCount }: TransactionSummaryProps) {
    return (
        <div className="h-full flex flex-col justify-between">
            <div className="flex flex-col mb-4">
                <h3 className="text-sm font-semibold tracking-wide text-foreground/60 uppercase">Billing & Transactions</h3>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-medium mt-1">
                    Performing • 1h
                </p>
            </div>
            
            <div className="space-y-4">
                {/* Transactions */}
                <div className="flex items-center justify-between pb-3 border-b border-border/50 group">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-surface border border-border shadow-sm text-foreground/70 group-hover:text-accent transition-colors">
                            <ShoppingCart size={16} className="stroke-[1.5]" />
                        </div>
                        <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground transition-colors">Total Sales</span>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold tracking-tight text-foreground">{transactionCount.toLocaleString()}</div>
                    </div>
                </div>

                {/* Customers */}
                <div className="flex items-center justify-between pb-1 group">
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
        </div>
    );
}
