"use client";

import React, { useState, useMemo } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { TablePagination } from '@/components/ui/TablePagination';
import { LoginActivity } from '@/lib/types';
import { Smartphone, Monitor, Shield } from 'lucide-react';
import clsx from 'clsx';
import styles from '@/components/ui/ui.module.css';

const MOCK_ACTIVITY: LoginActivity[] = [
    { id: '1', user_id: 'u1', timestamp: '2026-02-02 10:30 AM', ip_address: '192.168.1.15', location: 'Kochi, Kerala', device: 'Chrome on Windows', browser: 'Chrome', status: 'success', is_suspicious: false },
    { id: '2', user_id: 'u1', timestamp: '2026-02-01 09:15 AM', ip_address: '192.168.1.15', location: 'Kochi, Kerala', device: 'Chrome on Windows', browser: 'Chrome', status: 'success', is_suspicious: false },
    { id: '3', user_id: 'u1', timestamp: '2026-02-01 08:45 PM', ip_address: '103.21.58.12', location: 'Mumbai, Maharashtra', device: 'Safari on iPhone', browser: 'Safari', status: 'success', is_suspicious: true },
    { id: '4', user_id: 'u1', timestamp: '2026-01-31 02:20 PM', ip_address: '192.168.1.15', location: 'Kochi, Kerala', device: 'Chrome on Windows', browser: 'Chrome', status: 'failed', is_suspicious: false },
    { id: '5', user_id: 'u1', timestamp: '2026-01-30 11:10 AM', ip_address: '192.168.1.15', location: 'Kochi, Kerala', device: 'Chrome on Windows', browser: 'Chrome', status: 'success', is_suspicious: false },
    { id: '6', user_id: 'u1', timestamp: '2026-01-29 03:45 PM', ip_address: '192.168.1.15', location: 'Kochi, Kerala', device: 'Firefox on Windows', browser: 'Firefox', status: 'success', is_suspicious: false },
    { id: '7', user_id: 'u1', timestamp: '2026-01-28 12:30 PM', ip_address: '45.116.232.91', location: 'Delhi, India', device: 'Chrome on Android', browser: 'Chrome', status: 'success', is_suspicious: true },
    { id: '8', user_id: 'u1', timestamp: '2026-01-27 09:00 AM', ip_address: '192.168.1.15', location: 'Kochi, Kerala', device: 'Chrome on Windows', browser: 'Chrome', status: 'success', is_suspicious: false },
];

type SortField = 'timestamp' | 'location' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export default function LoginActivityTable() {
    const [sortField, setSortField] = useState<SortField>('timestamp');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc'); // Most recent first
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed' | 'suspicious'>('all');

    // Filtering
    const filteredData = useMemo(() => {
        return MOCK_ACTIVITY.filter(log => {
            if (statusFilter === 'all') return true;
            if (statusFilter === 'suspicious') return log.is_suspicious;
            return log.status === statusFilter;
        });
    }, [statusFilter]);

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

    return (
        <div className="space-y-6">
            {/* Header and Filters - Glassmorphic Card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl bg-surface backdrop-blur-md border border-border shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">Recent Login Activity</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={clsx(
                            'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                            statusFilter === 'all'
                                ? 'bg-primary text-white shadow-glow'
                                : 'bg-black/20 text-gray-400 hover:text-white hover:bg-white/10'
                        )}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStatusFilter('success')}
                        className={clsx(
                            'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                            statusFilter === 'success'
                                ? 'bg-success text-white shadow-glow-success'
                                : 'bg-black/20 text-gray-400 hover:text-white hover:bg-white/10'
                        )}
                    >
                        Success
                    </button>
                    <button
                        onClick={() => setStatusFilter('failed')}
                        className={clsx(
                            'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                            statusFilter === 'failed'
                                ? 'bg-destructive text-white shadow-glow-error'
                                : 'bg-black/20 text-gray-400 hover:text-white hover:bg-white/10'
                        )}
                    >
                        Failed
                    </button>
                    <button
                        onClick={() => setStatusFilter('suspicious')}
                        className={clsx(
                            'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                            statusFilter === 'suspicious'
                                ? 'bg-warning text-white shadow-glow-warning'
                                : 'bg-black/20 text-gray-400 hover:text-white hover:bg-white/10'
                        )}
                    >
                        Suspicious
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="relative">
                <Table className="relative">
                    <TableHeader className="sticky top-0 z-10">
                        <TableRow>
                            <TableHead>Device</TableHead>
                            <TableHead
                                sortable
                                sortDirection={sortField === 'location' ? sortDirection : null}
                                onSort={() => handleSort('location')}
                            >
                                Location
                            </TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead
                                sortable
                                sortDirection={sortField === 'timestamp' ? sortDirection : null}
                                onSort={() => handleSort('timestamp')}
                            >
                                Time
                            </TableHead>
                            <TableHead
                                sortable
                                sortDirection={sortField === 'status' ? sortDirection : null}
                                onSort={() => handleSort('status')}
                            >
                                Status
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((log, index) => (
                            <TableRow
                                key={log.id}
                                className={clsx(
                                    log.is_suspicious && 'shadow-[inset_0_0_0_1px_rgba(245,158,11,0.3)] bg-warning/5',
                                    styles['animate-slide-up']
                                )}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {log.device.toLowerCase().includes('phone') ? (
                                            <Smartphone size={16} className="text-gray-500" />
                                        ) : (
                                            <Monitor size={16} className="text-gray-500" />
                                        )}
                                        <span className="text-sm font-medium">{log.device}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-400">{log.location}</TableCell>
                                <TableCell className="font-mono text-xs text-gray-500">
                                    {log.ip_address}
                                </TableCell>
                                <TableCell className="text-gray-400">{log.timestamp}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={clsx(
                                                styles.badge,
                                                log.status === 'success' ? styles['badge-success'] : styles['badge-danger']
                                            )}
                                        >
                                            {log.status}
                                        </span>
                                        {log.is_suspicious && (
                                            <span className={clsx(styles.badge, styles['badge-warning'])}>
                                                <Shield size={10} className="mr-1" />
                                                Suspicious
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {sortedData.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden shadow-sm">
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
        </div>
    );
}
