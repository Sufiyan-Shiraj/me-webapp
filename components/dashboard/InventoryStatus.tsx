import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Package } from 'lucide-react';
import clsx from 'clsx';
import styles from '@/components/ui/ui.module.css';

export default function InventoryStatus() {
    return (
        <Card className="h-full bg-surface backdrop-blur-xl border border-white/5 shadow-glass">
            <CardHeader className="border-b border-white/5">
                <h3 className="text-sm font-semibold tracking-tight text-white uppercase">Inventory Status</h3>
                <Package className="text-primary" size={16} />
            </CardHeader>
            <CardBody>
                <div className="space-y-6">
                    <div className="flex items-end justify-between group">
                        <div>
                            <div className="text-2xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">1,240</div>
                            <div className="text-xs text-gray-400 font-bold uppercase mt-1">In Stock</div>
                        </div>
                        <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[90%] shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                        </div>
                    </div>
                    <div className="flex items-end justify-between group">
                        <div>
                            <div className="text-2xl font-bold tracking-tight text-white group-hover:text-warning transition-colors">18</div>
                            <div className="text-xs text-gray-400 font-bold uppercase mt-1">Low Stock</div>
                        </div>
                        <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-warning w-[15%]" />
                        </div>
                    </div>
                    <div className="flex items-end justify-between group">
                        <div>
                            <div className="text-2xl font-bold tracking-tight text-white group-hover:text-destructive transition-colors">5</div>
                            <div className="text-xs text-gray-400 font-bold uppercase mt-1">Out of Stock</div>
                        </div>
                        <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-destructive w-[5%]" />
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
