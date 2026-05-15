"use client";

import React from 'react';
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
            case 'auth': return <LogIn size={16} className="stroke-[1.5]" />;
            case 'sale': return <ShoppingCart size={16} className="stroke-[1.5]" />;
            case 'inventory': return <Package size={16} className="stroke-[1.5]" />;
            case 'user': return <UserCircle size={16} className="stroke-[1.5]" />;
            default: return <Activity size={16} className="stroke-[1.5]" />;
        }
    };

    const getColorClass = (type: string, status?: string) => {
        if (status === 'failed') return 'text-destructive bg-destructive/10 border border-destructive/20';
        switch (type) {
            case 'auth': return 'text-accent bg-accent/10 border border-accent/20';
            case 'sale': return 'text-primary bg-primary/10 border border-primary/20';
            case 'inventory': return 'text-warning bg-warning/10 border border-warning/20';
            case 'user': return 'text-info bg-info/10 border border-info/20';
            default: return 'text-foreground/50 bg-background border border-border';
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col mb-4">
                <h3 className="text-sm font-semibold tracking-wide text-foreground/60 uppercase">Recent Activity</h3>
                <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-medium mt-1">
                    Live Updates
                </p>
            </div>
            <div className="space-y-4 flex-1">
                {activities.length > 0 ? (
                    activities.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-border/50 last:border-0 last:pb-0">
                            <div className={`p-2 rounded-xl mt-0.5 ${getColorClass(item.type, item.status)}`}>
                                {getIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="text-sm font-semibold text-foreground truncate">
                                        {item.user} <span className="text-foreground/60 font-medium">{item.action.toLowerCase()}</span>
                                    </p>
                                    <span className="text-xs text-foreground/40 font-medium whitespace-nowrap">
                                        {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-xs text-foreground/60 truncate">{item.details}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-8 flex flex-col items-center justify-center h-full text-center">
                        <Activity size={32} className="text-foreground/20 mb-3 stroke-[1.5]" />
                        <p className="text-sm font-semibold text-foreground/80">No recent activity</p>
                        <p className="text-xs text-foreground/50 mt-1">Activity will show up here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
