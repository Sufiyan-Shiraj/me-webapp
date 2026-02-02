import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function LowStockAlerts() {
    const alerts = [
        { id: 1, name: 'Wireless Mouse', stock: 12, threshold: 20 },
        { id: 2, name: 'USB-C Cable', stock: 8, threshold: 15 },
        { id: 3, name: 'Monitor Stand', stock: 4, threshold: 10 },
    ];

    if (alerts.length === 0) return null;

    return (
        <Card className="bg-surface backdrop-blur-xl border border-white/5 shadow-glass">
            <CardHeader className="border-b border-white/5">
                <h3 className="text-sm font-semibold tracking-tight text-white uppercase">Low Stock Alerts</h3>
                <AlertTriangle className="text-warning" size={16} />
            </CardHeader>
            <CardBody>
                <div className="divide-y divide-white/5">
                    {alerts.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 group">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-200 group-hover:text-primary transition-colors truncate">
                                    {item.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    Threshold: {item.threshold}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-warning">
                                        {item.stock} left
                                    </p>
                                </div>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 rounded-lg">
                                    <ArrowRight size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}
