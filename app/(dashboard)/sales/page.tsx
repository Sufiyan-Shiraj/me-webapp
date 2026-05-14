"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { TablePagination } from '@/components/ui/TablePagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, Filter, FileText, Download, TrendingUp } from 'lucide-react';
import { SaleInvoice, InvoiceItem, ItemStatus } from '@/lib/types';
import clsx from 'clsx';
import styles from '@/components/ui/ui.module.css';
import { SaleModal } from '@/components/sales/SaleModal';
import { motion } from 'framer-motion';

import { supabase } from '@/lib/supabase';

// --- Types ---
interface SaleRowProps {
    sale: SaleInvoice;
    onUpdateItem?: (id: string, updates: Partial<InvoiceItem>) => void;
}

const SaleRow = ({ sale, onUpdateItem }: SaleRowProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Derived statuses
    const getItemStatus = (item: InvoiceItem): ItemStatus => {
        if (item.done) return 'completed';
        if (item.pending > 0) return 'pending';
        return 'waiting';
    };

    const overallStatus = useMemo(() => {
        if (!sale.items || sale.items.length === 0) return 'waiting';
        const allCompleted = sale.items.every(item => item.done);
        if (allCompleted) return 'completed';
        const anyPending = sale.items.some(item => item.pending > 0);
        if (anyPending) return 'pending';
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
                className={clsx("cursor-pointer group", styles['animate-slide-up'])}
                onClick={() => setIsOpen(!isOpen)}
            >
                <TableCell className="font-mono text-xs font-medium text-gray-400 group-hover:text-primary/80 transition-colors">
                    <div className="flex items-center gap-2">
                        <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" className="text-gray-500">
                                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.div>
                        #{sale.sale_id}
                    </div>
                </TableCell>
                <TableCell className="text-gray-400 text-sm">{new Date(sale.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium text-foreground group-hover:text-white transition-colors">{sale.customer_name}</TableCell>
                <TableCell>
                    <span className={clsx(styles.badge, getStatusBadgeClass(overallStatus), 'shadow-sm uppercase')}>
                        {overallStatus}
                    </span>
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-all">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:text-primary" title="View">
                            <FileText size={15} />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>

            {/* Expandable Items Row */}
            {isOpen && (
                <TableRow className="bg-black/20 border-l-2 border-primary/50">
                    <TableCell colSpan={5} className="p-0">
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="p-4 bg-white/5"
                        >
                            <div className="grid grid-cols-5 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 pb-2 mb-2">
                                <div className="col-span-2">Item / Variant</div>
                                <div className="text-center">Qty / Pending</div>
                                <div className="text-center">Status</div>
                                <div className="text-right">Mark Done</div>
                            </div>
                            {sale.items.map((item) => {
                                const status = getItemStatus(item);
                                return (
                                    <div key={item.id} className="grid grid-cols-5 gap-4 items-center py-2 border-b border-white/5 last:border-0">
                                        <div className="col-span-2 text-sm font-medium text-white">
                                            {item.product_name}
                                            <span className="text-[10px] text-gray-500 block">{item.variant}</span>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-white">{item.quantity} nos</div>
                                            {item.pending > 0 && <div className="text-[10px] text-warning">{item.pending} pending</div>}
                                        </div>
                                        <div className="text-center">
                                            <span className={clsx(styles.badge, getStatusBadgeClass(status), 'text-[10px] py-0 px-2')}>
                                                {status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <input 
                                                type="checkbox" 
                                                checked={item.done}
                                                onChange={(e) => onUpdateItem?.(item.id, { done: e.target.checked })}
                                                className="w-4 h-4 rounded border-white/10 bg-black/40 text-primary focus:ring-primary/50 cursor-pointer"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
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

            // Group by sale_id
            const grouped = new Map<number, SaleInvoice>();
            rows?.forEach((row: any) => {
                const saleId = row.sale_id;
                
                // Safety checks for joins
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
            // Fallback to empty
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
                    done: updates.done,
                    done_time: updates.done ? new Date().toISOString() : null
                })
                .eq('id', itemId);

            if (error) throw error;
            
            // Optimistic update
            setData(prev => prev.map(sale => ({
                ...sale,
                items: sale.items.map(item => item.id === itemId ? { ...item, ...updates } : item)
            })));
        } catch (error) {
            console.error("Error updating item:", error);
        }
    };

    // Filtering
    const filteredData = useMemo(() => {
        return data.filter(inv =>
            inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.sale_id.toString().includes(searchQuery)
        );
    }, [searchQuery, data]);

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleNewSale = async (invoiceData: any) => {
        // Mock add for now as we don't have the full multi-item insert logic here yet
        fetchSales();
    };

    return (
        <div className="container mx-auto space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-sans font-bold tracking-tight text-primary">Sales Transactions</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage and track your customer orders.</p>
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
                        placeholder="Search customer or sale ID..."
                        className="pl-10 bg-black/20 border-white/5 focus:border-primary/50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                </div>
            </div>

            {/* Table */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface backdrop-blur-xl shadow-glass">
                <div className="overflow-x-auto">
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
                                    <TableCell colSpan={5} className="py-20 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-3"></div>
                                        Loading sales...
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
                                    <TableCell colSpan={5}>
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
                </div>
            </div>

            {/* Pagination */}
            {!isLoading && filteredData.length > 0 && (
                <div className="rounded-xl border border-border shadow-sm mt-4">
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
