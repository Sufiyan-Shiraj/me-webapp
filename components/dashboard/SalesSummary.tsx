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
        <Card className="h-full bg-surface backdrop-blur-xl border border-white/5 shadow-glass">
            <CardHeader className="border-b border-white/5">
                <h3 className="text-sm font-semibold tracking-tight text-white uppercase">Operational Overview</h3>
                <Button variant="ghost" size="sm" icon={Download}>Export</Button>
            </CardHeader>
            <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Transactions Card */}
                    <div className="p-5 rounded-xl border border-white/5 bg-black/20 backdrop-blur-sm group hover:border-primary/20 transition-all duration-300">
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <ShoppingCart size={16} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
                        </div>
                        <div className="text-3xl font-bold tracking-tight text-white mb-1">{transactionCount.toLocaleString()}</div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">All Time Volume</p>
                    </div>

                    {/* Customers Card */}
                    <div className="p-5 rounded-xl border border-white/5 bg-black/20 backdrop-blur-sm group hover:border-accent/20 transition-all duration-300">
                        <div className="flex items-center gap-2 text-gray-400 mb-3">
                            <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                                <Users size={16} />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider">Active Customers</span>
                        </div>
                        <div className="text-3xl font-bold tracking-tight text-white mb-1">{customerCount.toLocaleString()}</div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Registered Base</p>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
