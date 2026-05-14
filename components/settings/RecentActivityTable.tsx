"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { TablePagination } from '@/components/ui/TablePagination';
import { Activity, Package, ShoppingCart, User, Settings, Shield, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import styles from '@/components/ui/ui.module.css';
import { getRecentActivity } from '@/lib/actions/activityActions';
import { motion, AnimatePresence } from 'framer-motion';

export interface ActivityLog {
    id: string;
    user: string;
    action: string;
    details: string;
    timestamp: string;
    type: 'inventory' | 'sales' | 'auth' | 'system';
}

export default function RecentActivityTable() {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
    const [sortField, setSortField] = useState<SortField>('timestamp');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const fetchActivity = async () => {
            setIsLoading(true);
            const data = await getRecentActivity();
            setActivities(data as ActivityLog[]);
            setIsLoading(false);
        };
        fetchActivity();
    }, []);

    // Filtering
    const filteredData = useMemo(() => {
        return activities.filter(log => {
            if (statusFilter === 'all') return true;
            return (log as any).status === statusFilter;
        });
    }, [activities, statusFilter]);

    // Sorting
    const sortedData = useMemo(() => {
        if (!sortDirection) return filteredData;

        return [...filteredData].sort((a, b) => {
            let aValue: any, bValue: any;

            if (sortField === 'timestamp') {
                aValue = new Date(a.timestamp).getTime();
                bValue = new Date(b.timestamp).getTime();
            } else {
                aValue = a[sortField];
                bValue = b[sortField];
            }

            if (aValue === bValue) return 0;

            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev =>
                prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
            );
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getTypeIcon = (type: string) => {
        return <Shield size={16} className="text-accent" />;
    };

    const getTypeColor = (type: string) => {
        return 'bg-accent/10 text-accent border-accent/20';
    };

    const formatTime = (ts: string) => {
        try {
            return new Date(ts).toLocaleString([], { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch {
            return ts;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-white border border-border shadow-sm">
                <div className="flex items-center gap-3">
                    <div 
                        className="p-2 rounded-lg bg-accent/10 text-accent cursor-pointer hover:bg-accent/20 transition-colors"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        title={isCollapsed ? "Maximize" : "Minimize"}
                    >
                        <Shield size={20} className={clsx("transition-transform duration-300", isCollapsed && "rotate-180")} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Recent Login Activity
                    </h3>
                </div>
                {!isCollapsed && (
                    <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
                        {(['all', 'success', 'failed'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={clsx(
                                    'px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize border',
                                    statusFilter === status
                                        ? 'bg-accent text-white border-accent shadow-sm'
                                        : 'bg-gray-50 text-gray-600 border-border hover:bg-gray-100 hover:text-foreground'
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="relative">
                            <Table className="relative bg-white border border-border rounded-lg overflow-hidden shadow-sm">
                                <TableHeader className="sticky top-0 z-10 bg-gray-50">
                                    <TableRow>
                                        <TableHead
                                            sortable
                                            sortDirection={sortField === 'type' ? sortDirection : null}
                                            onSort={() => handleSort('type')}
                                        >
                                            Type
                                        </TableHead>
                                        <TableHead
                                            sortable
                                            sortDirection={sortField === 'action' ? sortDirection : null}
                                            onSort={() => handleSort('action')}
                                        >
                                            Action
                                        </TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead
                                            sortable
                                            sortDirection={sortField === 'timestamp' ? sortDirection : null}
                                            onSort={() => handleSort('timestamp')}
                                        >
                                            Time
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-20 text-gray-500">
                                                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto mb-3"></div>
                                                 Loading activity...
                                            </TableCell>
                                        </TableRow>
                                    ) : paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                No activity found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((log, index) => (
                                            <TableRow
                                                key={log.id}
                                                className={clsx(styles['animate-slide-up'], "hover:bg-gray-50 transition-colors cursor-pointer")}
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getTypeIcon(log.type)}
                                                        <span className={clsx(
                                                            "text-[10px] px-2.5 py-1 rounded-md border uppercase tracking-wider font-bold",
                                                            getTypeColor(log.type)
                                                        )}>
                                                            {log.type}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <span className={clsx(
                                                            "font-semibold text-sm",
                                                            log.action.includes('Success') ? "text-success" : "text-destructive"
                                                        )}>
                                                            {log.action}
                                                        </span>
                                                        {(log as any).is_suspicious && (
                                                            <span className="flex items-center gap-1 text-[10px] bg-destructive-bg text-destructive border border-destructive-border px-2 py-0.5 rounded-md uppercase font-bold animate-pulse">
                                                                <Shield size={10} /> Suspicious
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-600 text-sm font-medium">{log.details}</TableCell>
                                                <TableCell>
                                                    <span className="flex items-center gap-2 text-sm text-foreground font-medium">
                                                        <User size={14} className="text-gray-400" /> {log.user}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-gray-500 text-sm font-medium whitespace-nowrap">{formatTime(log.timestamp)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {sortedData.length > 0 && (
                            <div className="mt-4 rounded-xl border border-border overflow-hidden shadow-sm bg-white">
                                <TablePagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={sortedData.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

type SortField = 'timestamp' | 'action' | 'type';
type SortDirection = 'asc' | 'desc' | null;
