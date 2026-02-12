"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { TablePagination } from '@/components/ui/TablePagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, Filter, FileText, Download, TrendingUp } from 'lucide-react';
import { SaleInvoice } from '@/lib/types';
import clsx from 'clsx';
import styles from '@/components/ui/ui.module.css';
import { SaleModal } from '@/components/sales/SaleModal';

// Mock Data with Rupees
const INVOICES: SaleInvoice[] = [
    { id: '1', invoice_number: 'INV-001', date: '2023-11-01', customer_name: 'Acme Corp', subtotal: 85000, tax: 8500, total: 93500, status: 'paid', items: [] },
    { id: '2', invoice_number: 'INV-002', date: '2023-11-02', customer_name: 'Global Industries', subtotal: 210000, tax: 21000, total: 231000, status: 'pending', items: [] },
    { id: '3', invoice_number: 'INV-003', date: '2023-11-03', customer_name: 'TechStart Inc', subtotal: 42000, tax: 4200, total: 46200, status: 'overdue', items: [] },
    { id: '4', invoice_number: 'INV-004', date: '2023-11-04', customer_name: 'John Doe', subtotal: 12500, tax: 1250, total: 13750, status: 'paid', items: [] },
    { id: '5', invoice_number: 'INV-005', date: '2023-11-05', customer_name: 'Small Biz LLC', subtotal: 100000, tax: 10000, total: 110000, status: 'cancelled', items: [] },
    { id: '6', invoice_number: 'INV-006', date: '2023-11-06', customer_name: 'Kerala Polymers', subtotal: 65000, tax: 6500, total: 71500, status: 'paid', items: [] },
    { id: '7', invoice_number: 'INV-007', date: '2023-11-07', customer_name: 'Kochi Plastics', subtotal: 180000, tax: 18000, total: 198000, status: 'pending', items: [] },
    { id: '8', invoice_number: 'INV-008', date: '2023-11-08', customer_name: 'India Makers', subtotal: 32000, tax: 3200, total: 35200, status: 'paid', items: [] },
];

type SortField = keyof SaleInvoice;
type SortDirection = 'asc' | 'desc' | null;

export default function SalesPage() {
    const [data, setData] = useState<SaleInvoice[]>(INVOICES);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filtering
    const filteredData = useMemo(() => {
        return data.filter(inv =>
            inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, data]);

    // Sorting
    const sortedData = useMemo(() => {
        if (!sortDirection) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortField] ?? '';
            const bValue = b[sortField] ?? '';

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
            setSortDirection(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleNewSale = (invoiceData: Omit<SaleInvoice, 'id' | 'items'>) => {
        const newInvoice: SaleInvoice = {
            id: Math.random().toString(36).substr(2, 9),
            items: [],
            ...invoiceData
        };
        setData(prev => [newInvoice, ...prev]);
    };

    const handleExport = () => {
        const headers = ['Invoice #', 'Date', 'Customer', 'Status'];
        const rows = data.map(inv => [
            inv.invoice_number,
            inv.date,
            inv.customer_name,
            inv.status
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sales_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'paid': return styles['badge-success'];
            case 'pending': return styles['badge-warning'];
            case 'overdue': return styles['badge-danger'];
            case 'cancelled': return styles['badge-info']; // or gray
            default: return styles['badge-info'];
        }
    };

    return (
        <div className="container mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-sans font-bold tracking-tight text-primary">Sales Transactions</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage and track your sales invoices.</p>
                </div>
                <div className="flex gap-2">
                    <Button icon={Plus} className="shadow-lg shadow-primary/20" onClick={() => setIsModalOpen(true)}>
                        New Sale
                    </Button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 p-4 rounded-xl bg-surface backdrop-blur-md border border-border shadow-sm">
                <div className="relative w-full lg:w-96 group">
                    <Input
                        placeholder="Search sales..."
                        className="pl-10 bg-black/20 border-white/5 focus:border-primary/50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={Filter} size="sm">Filter</Button>
                    <Button variant="secondary" icon={FileText} size="sm" onClick={handleExport}>Export</Button>
                </div>
            </div>

            {/* Table */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface backdrop-blur-xl shadow-glass">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead sortable sortDirection={sortField === 'invoice_number' ? sortDirection : null} onSort={() => handleSort('invoice_number')}>Invoice #</TableHead>
                                <TableHead sortable sortDirection={sortField === 'date' ? sortDirection : null} onSort={() => handleSort('date')}>Date</TableHead>
                                <TableHead sortable sortDirection={sortField === 'customer_name' ? sortDirection : null} onSort={() => handleSort('customer_name')}>Customer</TableHead>
                                <TableHead sortable sortDirection={sortField === 'status' ? sortDirection : null} onSort={() => handleSort('status')}>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((inv, index) => (
                                    <TableRow
                                        key={inv.id}
                                        className={clsx("cursor-pointer group", styles['animate-slide-up'])}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <TableCell className="font-mono text-xs font-medium text-gray-400 group-hover:text-primary/80 transition-colors">{inv.invoice_number}</TableCell>
                                        <TableCell className="text-gray-400 text-sm">{inv.date}</TableCell>
                                        <TableCell className="font-medium text-foreground group-hover:text-white transition-colors">{inv.customer_name}</TableCell>
                                        <TableCell>
                                            <span className={clsx(styles.badge, getStatusBadgeClass(inv.status), 'shadow-sm uppercase')}>
                                                {inv.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-all">
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-primary" title="View">
                                                    <FileText size={15} />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-primary" title="Download">
                                                    <Download size={15} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <EmptyState
                                            variant={searchQuery ? "no-results" : "no-data"}
                                            title={searchQuery ? "No invoices found" : "No sales yet"}
                                            description="Create a new sale to see it here."
                                            action={!searchQuery ? { label: "New Sale", onClick: () => setIsModalOpen(true) } : undefined}
                                        />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            {sortedData.length > 0 && (
                <div className="rounded-xl border border-border shadow-sm mt-4">
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

            <SaleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleNewSale} />
        </div>
    );
}
