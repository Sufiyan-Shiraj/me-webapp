"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { TablePagination } from '@/components/ui/TablePagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, FileText, Filter, X, ChevronDown, Calendar, Hash, Download } from 'lucide-react';
import { SaleInvoice, InvoiceItem, ItemStatus } from '@/lib/types';
import clsx from 'clsx';
import styles from '@/components/ui/ui.module.css';
import { SaleModal } from '@/components/sales/SaleModal';
import { SalesExportPreviewModal } from '@/components/sales/SalesExportPreviewModal';
import { Select } from '@/components/ui/Select';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/lib/supabase';
import { updateSaleItem } from '@/lib/actions/salesActions';

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
            <AnimatePresence>
                {isOpen && (
                    <TableRow className="bg-accent/[0.02] border-l-2 border-accent border-b-0 hover:bg-accent/[0.02]">
                        <TableCell colSpan={5} className="p-0 border-b-0">
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="p-6 md:px-12 py-6">
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                        <div className="grid grid-cols-12 gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 p-4 bg-gray-50/50">
                                            <div className="col-span-5">Item / Variant</div>
                                            <div className="col-span-4 text-center">Fulfillment</div>
                                            <div className="col-span-3 text-right">Action</div>
                                        </div>
                                        <div className="divide-y divide-gray-50 max-h-[40vh] overflow-y-auto custom-scrollbar">
                                            {sale.items.map((item) => {
                                                const status = getItemStatus(item);
                                                return (
                                                    <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-gray-50/30 transition-colors">
                                                        <div className="col-span-5 flex flex-col">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold text-gray-900">{item.product_name}</span>
                                                                <span className={clsx(styles.badge, getStatusBadgeClass(status), 'text-[9px] py-0.5 px-2 uppercase shadow-sm tracking-wider')}>
                                                                    {status}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-gray-500 font-medium mt-1">{item.variant}</span>
                                                        </div>
                                                        <div className="col-span-4 flex justify-center items-center gap-8">
                                                            <div className="flex flex-col items-center w-16">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</span>
                                                                <span className="text-sm font-mono font-bold text-gray-900">{item.quantity}</span>
                                                            </div>
                                                            <div className="w-px h-8 bg-gray-200"></div>
                                                            <div className="flex flex-col items-center w-16">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pending</span>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max={item.quantity}
                                                                    value={item.pending.toString()}
                                                                    onChange={(e) => {
                                                                        const val = Math.max(0, Math.min(item.quantity, Number(e.target.value)));
                                                                        onUpdateItem?.(item.id, { pending: val, done: val === 0 });
                                                                    }}
                                                                    className="w-16 h-8 p-1 text-center font-mono text-sm font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-span-3 flex justify-end items-center">
                                                            <Button
                                                                size="sm"
                                                                variant={item.done ? "ghost" : "primary"}
                                                                disabled={item.done}
                                                                className={clsx(
                                                                    "h-9 text-xs font-bold px-4 rounded-xl transition-all", 
                                                                    item.done ? "text-success bg-success/10 opacity-70" : "shadow-md shadow-gray-900/10"
                                                                )}
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
                                </div>
                            </motion.div>
                        </TableCell>
                    </TableRow>
                )}
            </AnimatePresence>
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
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    
    // Advanced Filters State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        customer: 'all',
        item: 'all',
        variant: 'all',
        minQty: '',
        maxQty: '',
        startDate: '',
        endDate: ''
    });

    const filterOptions = useMemo(() => {
        const customers = new Set<string>();
        const items = new Set<string>();
        const variants = new Map<string, Set<string>>();

        data.forEach(sale => {
            customers.add(sale.customer_name);
            sale.items.forEach(item => {
                items.add(item.product_name);
                if (!variants.has(item.product_name)) {
                    variants.set(item.product_name, new Set());
                }
                variants.get(item.product_name)!.add(item.variant);
            });
        });

        return {
            customers: Array.from(customers).sort(),
            items: Array.from(items).sort(),
            variants: variants
        };
    }, [data]);

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
            const res = await updateSaleItem(itemId, {
                pending: updates.pending,
                done: updates.done
            });

            if (!res.success) throw new Error(res.error);

            setData(prev => prev.map(sale => ({
                ...sale,
                items: sale.items.map(item => item.id === itemId ? { ...item, ...updates } : item)
            })));
        } catch (error) {
            console.error("Error updating item:", error);
            alert("Failed to update item fulfillment.");
        }
    };

    const filteredData = useMemo(() => {
        return data.filter(inv => {
            // Search Query (Customer or Sale ID)
            const matchesSearch = inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inv.sale_id.toString().includes(searchQuery);
            if (!matchesSearch) return false;

            // Customer Filter
            if (filters.customer !== 'all' && inv.customer_name !== filters.customer) return false;

            // Item and Variant Filters
            const matchesItems = inv.items.some(item => {
                const itemMatch = filters.item === 'all' || item.product_name === filters.item;
                const variantMatch = filters.variant === 'all' || item.variant === filters.variant;
                
                // Quantity Filters
                const minMatch = !filters.minQty || item.quantity >= Number(filters.minQty);
                const maxMatch = !filters.maxQty || item.quantity <= Number(filters.maxQty);

                return itemMatch && variantMatch && minMatch && maxMatch;
            });
            if (!matchesItems) return false;

            // Date Filters
            if (filters.startDate) {
                const start = new Date(filters.startDate);
                if (new Date(inv.date) < start) return false;
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                if (new Date(inv.date) > end) return false;
            }

            return true;
        });
    }, [searchQuery, data, filters]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleNewSale = async (invoiceData: any) => {
        fetchSales();
    };

    const handleExport = () => {
        if (filteredData.length === 0) {
            alert("No data to export");
            return;
        }

        const headers = ['Sale ID', 'Date', 'Customer', 'Product', 'Variant', 'Quantity', 'Pending', 'Status'];
        
        const csvData = filteredData.flatMap(sale => 
            sale.items.map(item => {
                const itemStatus = item.done || item.pending === 0 ? 'Completed' : (item.pending < item.quantity ? 'Pending' : 'Waiting');
                return [
                    `#${sale.sale_id}`,
                    new Date(sale.date).toLocaleDateString(),
                    sale.customer_name,
                    item.product_name,
                    item.variant,
                    item.quantity,
                    item.pending,
                    itemStatus
                ].join(',');
            })
        );

        const csvContent = [headers.join(','), ...csvData].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        
        link.setAttribute('href', url);
        link.setAttribute('download', `sales_report_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sales Transactions</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your customer orders.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-3xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-80 group">
                            <Input
                                placeholder="Search customer or sale ID..."
                                className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:ring-gray-900 focus:border-gray-900 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
                        </div>
                        <Button 
                            variant="secondary" 
                            icon={isFilterOpen ? X : Filter} 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={clsx("h-11 px-5 rounded-xl transition-all whitespace-nowrap border-gray-200 font-semibold", isFilterOpen && "bg-gray-900 text-white hover:bg-black border-transparent")}
                        >
                            {isFilterOpen ? "Close Filters" : "Filters"}
                        </Button>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <Button variant="secondary" className="h-11 rounded-xl px-5 border-gray-200 font-semibold" icon={Download} onClick={() => setIsExportModalOpen(true)}>
                            Export CSV
                        </Button>
                        <Button variant="primary" className="h-11 rounded-xl px-5 font-semibold" icon={Plus} onClick={() => setIsModalOpen(true)}>
                            New Sale
                        </Button>
                    </div>
                </div>

                {/* Filter Panel */}
                {isFilterOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white border border-gray-100 rounded-3xl shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-300"
                    >
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Search size={12} /> Customer
                            </label>
                            <Select 
                                value={filters.customer}
                                onChange={(val) => setFilters(f => ({ ...f, customer: val as string }))}
                                options={[
                                    { value: 'all', label: 'All Customers' },
                                    ...filterOptions.customers.map(c => ({ value: c, label: c }))
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Plus size={12} /> Product
                            </label>
                            <Select 
                                value={filters.item}
                                onChange={(val) => setFilters(f => ({ ...f, item: val as string, variant: 'all' }))}
                                options={[
                                    { value: 'all', label: 'All Products' },
                                    ...filterOptions.items.map(i => ({ value: i, label: i }))
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <ChevronDown size={12} /> Variant
                            </label>
                            <Select 
                                value={filters.variant}
                                onChange={(val) => setFilters(f => ({ ...f, variant: val as string }))}
                                disabled={filters.item === 'all'}
                                options={[
                                    { value: 'all', label: 'All Variants' },
                                    ...(filters.item !== 'all' && filterOptions.variants.get(filters.item) ? 
                                        Array.from(filterOptions.variants.get(filters.item)!).sort().map(v => ({ value: v, label: v })) : 
                                        []
                                    )
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Hash size={12} /> Quantity Range
                            </label>
                            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-gray-900 transition-all h-10 px-1">
                                <input 
                                    type="number" 
                                    placeholder="Min" 
                                    className="w-full h-full bg-transparent text-sm px-2 outline-none text-center"
                                    value={filters.minQty}
                                    onChange={(e) => setFilters(f => ({ ...f, minQty: e.target.value }))}
                                />
                                <span className="text-gray-300 font-medium">-</span>
                                <input 
                                    type="number" 
                                    placeholder="Max" 
                                    className="w-full h-full bg-transparent text-sm px-2 outline-none text-center"
                                    value={filters.maxQty}
                                    onChange={(e) => setFilters(f => ({ ...f, maxQty: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} /> Date Range
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 relative group">
                                    <input 
                                        type="date" 
                                        className="w-full h-10 px-3 pl-9 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none transition-all [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
                                    />
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                                <span className="text-gray-300 font-medium text-sm">to</span>
                                <div className="flex-1 relative group">
                                    <input 
                                        type="date" 
                                        className="w-full h-10 px-3 pl-9 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-900 outline-none transition-all [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
                                    />
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 flex items-end justify-end gap-3">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-10 px-6 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-100/80 rounded-xl"
                                onClick={() => setFilters({
                                    customer: 'all',
                                    item: 'all',
                                    variant: 'all',
                                    minQty: '',
                                    maxQty: '',
                                    startDate: '',
                                    endDate: ''
                                })}
                            >
                                Reset All Filters
                            </Button>
                        </div>
                    </motion.div>
                )}
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
            
            <SalesExportPreviewModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                data={filteredData}
            />
        </div>
    );
}
