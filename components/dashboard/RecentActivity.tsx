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
        if (status === 'failed') return 'text-destructive bg-destructive-bg border border-destructive-border';
        switch (type) {
            case 'auth': return 'text-accent bg-accent/10 border border-accent/20';
            case 'sale': return 'text-primary bg-primary/10 border border-primary/20';
            case 'inventory': return 'text-warning bg-warning-bg border border-warning-border';
            case 'user': return 'text-info bg-info-bg border border-info-border';
            default: return 'text-gray-500 bg-gray-50 border border-gray-200';
        }
    };

    return (
        <div className="h-full">
            <div className="flex flex-col mb-4">
                <h3 className="text-sm font-semibold tracking-tight text-gray-900 uppercase">Recent Activity</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium mt-0.5">
                    Live Updates
                </p>
            </div>
            <div className="space-y-4">
                {activities.length > 0 ? (
                    activities.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                            <div className={`p-1.5 rounded-md ${getColorClass(item.type, item.status)}`}>
                                {getIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {item.user} <span className="text-gray-500 font-normal">{item.action.toLowerCase()}</span>
                                    </p>
                                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{item.details}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-4 text-center">
                        <p className="text-sm text-gray-500">No recent activity found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
