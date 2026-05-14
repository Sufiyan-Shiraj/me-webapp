"use client";

import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Activity, LogIn, ShoppingCart, Package, UserCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
    id: string;
    user: string;
    action: string;
    details: string;
    timestamp: string;
    type: string;
    status?: string;
}

interface RecentActivityProps {
    activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'auth': return <LogIn size={14} />;
            case 'sale': return <ShoppingCart size={14} />;
            case 'inventory': return <Package size={14} />;
            case 'user': return <UserCircle size={14} />;
            default: return <Activity size={14} />;
        }
    };

    const getColorClass = (type: string, status?: string) => {
        if (status === 'failed') return 'text-destructive bg-destructive/10';
        switch (type) {
            case 'auth': return 'text-accent bg-accent/10';
            case 'sale': return 'text-primary bg-primary/10';
            case 'inventory': return 'text-warning bg-warning/10';
            case 'user': return 'text-info bg-info/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    return (
        <Card className="h-full bg-surface backdrop-blur-xl border border-white/5 shadow-glass">
            <CardHeader className="border-b border-white/5">
                <h3 className="text-sm font-semibold tracking-tight text-white uppercase flex items-center gap-2">
                    <Activity size={16} className="text-primary" /> Recent Activity
                </h3>
            </CardHeader>
            <CardBody className="p-0">
                <div className="divide-y divide-white/5">
                    {activities.length > 0 ? (
                        activities.map((item) => (
                            <div key={item.id} className="p-4 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
                                <div className={`mt-0.5 p-2 rounded-lg ${getColorClass(item.type, item.status)}`}>
                                    {getIcon(item.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <p className="text-sm font-semibold text-white truncate">
                                            {item.user} <span className="text-gray-400 font-normal">{item.action.toLowerCase()}</span>
                                        </p>
                                        <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">{item.details}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-sm text-gray-500">No recent activity found.</p>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
}
