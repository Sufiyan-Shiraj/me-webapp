"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { TablePagination } from '@/components/ui/TablePagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, FileText } from 'lucide-react';
import { SaleInvoice, InvoiceItem, ItemStatus } from '@/lib/types';
import clsx from 'clsx';
import styles from '@/components/ui/ui.module.css';
import { SaleModal } from '@/components/sales/SaleModal';
import { motion } from 'framer-motion';

import { supabase } from '@/lib/supabase';

interface SaleRowProps {
    sale: SaleInvoice;
    onUpdateItem?: (id: string, updates: Partial<InvoiceItem>) => void;
}

const SaleRow = ({ sale, onUpdateItem }: SaleRowProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const getItemStatus = (item: InvoiceItem): ItemStatus => {
        if (item.done || item.pending === 0) return 'completed';
        if (item.pending < item.quantity) return 'pending';
        return 'waiting';
    };

    const overallStatus = useMemo(() => {
        if (!sale.items || sale.items.length === 0) return 'waiting';
        const allCompleted = sale.items.every(item => item.done || item.pending === 0);
        if (allCompleted) return 'completed';
        const anyFulfilled = sale.items.some(item => item.pending < item.quantity);
        if (anyFulfilled) return 'pending';
        return 'waiting';
    }, [sale.items]);

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'completed': return styles['badge-success'];
            case 'pending': return styles['badge-warning'];
            case 'waiting': return styles['badge-info'];
            default: return styles['badge-info'];
        }
    };

    return (
        <>
            <TableRow
                className={clsx("cursor-pointer group transition-colors", isOpen ? "bg-gray-50" : "", styles['animate-slide-up'])}
                onClick={() => setIsOpen(!isOpen)}
            >
                <TableCell className="font-mono text-sm font-medium text-gray-600 group-hover:text-accent transition-colors">
                    <div className="flex items-center gap-2">
                        <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" className="text-gray-400">
                                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.div>
                        #{sale.sale_id}
                    </div>
                </TableCell>
                <TableCell className="text-gray-600 text-sm">{new Date(sale.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium text-foreground group-hover:text-gray-900 transition-colors">{sale.customer_name}</TableCell>
                <TableCell>
                    <span className={clsx(styles.badge, getStatusBadgeClass(overallStatus), 'shadow-sm uppercase')}>
                        {overallStatus}
                    </span>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-accent hover:bg-accent/10 rounded-full" title="View details">
                            <FileText size={16} />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>

            {/* Expandable Items Row */}
            {isOpen && (
                <TableRow className="bg-gray-50 border-l-2 border-accent border-b-0 hover:bg-gray-50">
                    <TableCell colSpan={5} className="p-0">
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="p-4 sm:p-6"
                        >
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                <div className="grid grid-cols-5 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 p-4 bg-gray-50">
                                    <div className="col-span-2">Item / Variant</div>
                                    <div className="col-span-2 text-center">Fulfillment</div>
                                    <div className="text-center">Action</div>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {sale.items.map((item) => {
                                        const status = getItemStatus(item);
                                        return (
                                            <div key={item.id} className="grid grid-cols-5 gap-4 items-center p-4 hover:bg-gray-50 transition-colors">
                                                <div className="col-span-2 flex flex-col">
                                                    <span className="text-sm font-medium text-foreground">{item.product_name}</span>
                                                    <span className="text-xs text-gray-500 mt-0.5">{item.variant}</span>
                                                    <span className="mt-1">
                                                        <span className={clsx(styles.badge, getStatusBadgeClass(status), 'text-[10px] py-0 px-2 uppercase')}>
                                                            {status}
                                                        </span>
                                                    </span>
                                                </div>
                                                <div className="col-span-2 flex justify-center">
                                                    <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-2 border border-gray-100">
                                                        <div className="text-center">
                                                            <div className="text-[10px] text-gray-500 uppercase font-bold">Total</div>
                                                            <div className="text-sm text-foreground font-mono font-medium">{item.quantity}</div>
                                                        </div>
                                                        <div className="w-px h-6 bg-gray-200"></div>
                                                        <div className="text-center flex flex-col items-center">
                                                            <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Pending</div>
                                                            <Input
                                                                type="number"
                                                                value={item.pending.toString()}
                                                                onChange={(e) => {
                                                                    const val = Math.max(0, Math.min(item.quantity, Number(e.target.value)));
                                                                    onUpdateItem?.(item.id, { pending: val, done: val === 0 });
                                                                }}
                                                                className="w-16 h-8 p-1 text-center font-mono text-sm shadow-inner"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-center flex justify-center items-center">
                                                    <Button
                                                        size="sm"
                                                        variant={item.done ? "ghost" : "primary"}
                                                        disabled={item.done}
                                                        className={clsx("h-8 text-xs font-semibold px-3", item.done && "text-success bg-success-bg")}
                                                        onClick={() => onUpdateItem?.(item.id, { pending: 0, done: true })}
                                                    >
                                                        {item.done ? 'Finished' : 'Mark Done'}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
};

export default function SalesPage() {
    const [data, setData] = useState<SaleInvoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const { data: rows, error } = await supabase
                .from('me_sales')
                .select(`
                    id,
                    sale_id,
                    created_at,
                    quantity,
                    pending,
                    done,
                    done_time,
                    customers (
                        id,
                        name
                    ),
                    me_item_types (
                        id,
                        name,
                        me_items (
                            id,
                            name
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const grouped = new Map<number, SaleInvoice>();
            rows?.forEach((row: any) => {
                const saleId = row.sale_id;

                const customer = row.customers && !Array.isArray(row.customers) ? row.customers : { id: 'unknown', name: 'Unknown Customer' };
                const itemType = row.me_item_types && !Array.isArray(row.me_item_types) ? row.me_item_types : null;
                const baseItem = itemType?.me_items && !Array.isArray(itemType.me_items) ? itemType.me_items : { name: 'Unknown Item' };

                if (!grouped.has(saleId)) {
                    grouped.set(saleId, {
                        sale_id: saleId,
                        date: row.created_at,
                        customer_id: customer.id,
                        customer_name: customer.name,
                        items: []
                    });
                }

                const item: InvoiceItem = {
                    id: row.id,
                    item_type_id: itemType?.id || 'unknown',
                    product_name: baseItem.name,
                    variant: itemType?.name || 'Standard',
                    quantity: row.quantity,
                    pending: row.pending || 0,
                    done: row.done,
                    done_time: row.done_time
                };
                grouped.get(saleId)!.items.push(item);
            });

            setData(Array.from(grouped.values()));
        } catch (error: any) {
            console.error("Error fetching sales:", error?.message || error, error?.code, error?.details);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateItem = async (itemId: string, updates: Partial<InvoiceItem>) => {
        try {
            const { error } = await supabase
                .from('me_sales')
                .update({
                    pending: updates.pending ?? (updates.done ? 0 : undefined),
                    done: updates.done,
                    done_time: updates.done ? new Date().toISOString() : null
                })
                .eq('id', itemId);

            if (error) throw error;

            setData(prev => prev.map(sale => ({
                ...sale,
                items: sale.items.map(item => item.id === itemId ? { ...item, ...updates } : item)
            })));
        } catch (error) {
            console.error("Error updating item:", error);
        }
    };

    const filteredData = useMemo(() => {
        return data.filter(inv =>
            inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.sale_id.toString().includes(searchQuery)
        );
    }, [searchQuery, data]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleNewSale = async (invoiceData: any) => {
        fetchSales();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sales Transactions</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your customer orders.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="primary" className="h-11" icon={Plus} onClick={() => setIsModalOpen(true)}>
                        New Sale
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4 p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
                <div className="relative w-full sm:w-96 group">
                    <Input
                        placeholder="Search customer or sale ID..."
                        className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:ring-gray-900 focus:border-gray-900"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Sale ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="py-24 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
                                <span className="font-medium">Loading sales data...</span>
                            </TableCell>
                        </TableRow>
                    ) : paginatedData.length > 0 ? (
                        paginatedData.map((inv) => (
                            <SaleRow
                                key={inv.sale_id}
                                sale={inv}
                                onUpdateItem={handleUpdateItem}
                            />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="py-12">
                                <EmptyState
                                    variant={searchQuery ? "no-results" : "no-data"}
                                    title={searchQuery ? "No sales found" : "No sales yet"}
                                    description="Record a new sale to see it here."
                                    action={!searchQuery ? { label: "New Sale", onClick: () => setIsModalOpen(true) } : undefined}
                                />
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {!isLoading && filteredData.length > 0 && (
                <div className="rounded-3xl border border-gray-100 bg-white shadow-sm mt-6">
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredData.length}
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
