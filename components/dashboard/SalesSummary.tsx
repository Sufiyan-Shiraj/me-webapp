"use client";

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, ShoppingCart, Users } from 'lucide-react';

interface TransactionSummaryProps {
    transactionCount: number;
    customerCount: number;
}

export default function TransactionSummary({ transactionCount, customerCount }: TransactionSummaryProps) {
    return (
        <div className="h-full">
            <div className="flex flex-col mb-4">
                <h3 className="text-sm font-semibold tracking-tight text-gray-900 uppercase">Billing & Transactions</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mt-0.5">
                    Performing • 1h
                </p>
            </div>
            
            <div className="space-y-4">
                {/* Transactions */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-gray-100 text-gray-700">
                            <ShoppingCart size={14} />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Total Sales</span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{transactionCount.toLocaleString()}</div>
                    </div>
                </div>

                {/* Customers */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-info-bg text-info">
                            <Users size={14} />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">Active Customers</span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{customerCount.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
