"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { TablePagination } from '@/components/ui/TablePagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, FileText, Filter, X, ChevronDown, Calendar, Hash, Download, Trash2, MapPin, Edit3 } from 'lucide-react';
import { OrderInvoice, OrderItem, ItemStatus } from '@/lib/types';
import clsx from 'clsx';
import styles from '@/components/ui/ui.module.css';
import { OrderModal } from '../../../components/sales/OrderModal';
import { EditOrderModal } from '@/components/sales/EditOrderModal';
import { Select } from '@/components/ui/Select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { GenericExportModal } from '@/components/ui/GenericExportModal';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/lib/supabase';
import { updateOrderItem, deleteOrder } from '@/lib/actions/ordersActions';
import { getPlaces, createPlace } from '@/lib/actions/placesActions';

interface OrderRowProps {
    order: OrderInvoice;
    places: { id: string, name: string }[];
    onUpdateOrderPlace: (orderId: number, place: string) => void;
    onCreateOrderPlace: (name: string, orderId: number) => void;
    onEditOrder: (order: OrderInvoice) => void;
    onDeleteOrder: (orderId: number) => void;
}

const OrderRow = ({ order, places, onUpdateOrderPlace, onCreateOrderPlace, onEditOrder, onDeleteOrder }: OrderRowProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const overallStatus = useMemo(() => {
        if (!order.items || order.items.length === 0) return 'waiting';
        const allCompleted = order.items.every(item => item.done || item.pending === 0);
        if (allCompleted) return 'completed';
        const anyFulfilled = order.items.some(item => item.pending < item.quantity);
        if (anyFulfilled) return 'pending';
        return 'waiting';
    }, [order.items]);

    return (
        <>
            <TableRow
                className={clsx("cursor-pointer group transition-colors", isOpen ? "bg-gray-50" : "", styles['animate-slide-up'])}
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* Mobile combined cell */}
                <TableCell className="sm:hidden">
                    <div className="flex items-start gap-2">
                        <div className="mt-1">
                            <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                                <svg width="12" height="7" viewBox="0 0 12 7" fill="none" className="text-gray-400">
                                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </motion.div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{order.customer_name}</span>
                            <span className="text-xs text-gray-500 font-mono mt-0.5">#{order.order_id} • {new Date(order.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </TableCell>

                {/* Desktop separate cells */}
                <TableCell className="hidden sm:table-cell font-mono text-sm font-medium text-gray-600 group-hover:text-accent transition-colors">
                    <div className="flex items-center gap-2">
                        <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
                            <svg width="12" height="7" viewBox="0 0 12 7" fill="none" className="text-gray-400">
                                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.div>
                        #{order.order_id}
                    </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-gray-600 text-sm">{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell className="hidden sm:table-cell font-medium text-foreground group-hover:text-gray-900 transition-colors">{order.customer_name}</TableCell>
                
                <TableCell className="w-32 sm:w-48">
                    <div onClick={(e) => e.stopPropagation()} className="w-32 sm:w-40">
                        <Select
                            options={places.map(p => ({ value: p.name, label: p.name }))}
                            value={order.items[0]?.place || ''}
                            onChange={(val) => onUpdateOrderPlace(order.order_id, val as string)}
                            allowCreate
                            onCreateOption={(val) => onCreateOrderPlace(val, order.order_id)}
                        />
                    </div>
                </TableCell>
                <TableCell className="text-right px-2 sm:px-4" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1 sm:gap-2 opacity-100 sm:opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:text-accent hover:bg-accent/10 rounded-full" title="Edit Order" onClick={() => onEditOrder(order)}>
                            <Edit3 size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:text-red-600 hover:bg-red-50 rounded-full text-red-500" title="Delete Order" onClick={() => onDeleteOrder(order.order_id)}>
                            <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
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
                                <div className="p-3 sm:p-6 md:px-12 py-4 sm:py-6 overflow-x-auto">
                                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm min-w-full">
                                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 p-3 sm:p-4 bg-gray-50/50">
                                            <div className="flex-1">Item / Variant</div>
                                            <div className="w-[120px] sm:w-48 text-center">Fulfillment</div>
                                        </div>
                                        <div className="divide-y divide-gray-50 max-h-[40vh] overflow-y-auto custom-scrollbar">
                                            {order.items.map((item) => {
                                                return (
                                                    <div key={item.id} className="flex justify-between items-center p-3 sm:p-4 hover:bg-gray-50/30 transition-colors">
                                                        <div className="flex-1 flex flex-col pr-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold text-gray-900">{item.product_name}</span>
                                                            </div>
                                                            <span className="text-xs text-gray-500 font-medium mt-1">{item.variant}</span>
                                                        </div>
                                                        <div className="w-[120px] sm:w-48 flex justify-center items-center gap-2 sm:gap-6">
                                                            <div className="flex flex-col items-center flex-1">
                                                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</span>
                                                                <span className="text-xs sm:text-sm font-mono font-bold text-gray-900">{item.quantity}</span>
                                                            </div>
                                                            <div className="w-px h-6 sm:h-8 bg-gray-200"></div>
                                                            <div className="flex flex-col items-center flex-1">
                                                                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pend</span>
                                                                <span className="text-xs sm:text-sm font-mono font-bold text-orange-600">{item.pending}</span>
                                                            </div>
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

export default function OrdersPage() {
    const [data, setData] = useState<OrderInvoice[]>([]);
    const [places, setPlaces] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [editOrder, setEditOrder] = useState<OrderInvoice | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Advanced Filters State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        customer: [] as string[],
        item: [] as string[],
        variant: [] as string[],
        minQty: '',
        maxQty: '',
        startDate: '',
        endDate: '',
        place: [] as string[],
        pendingOnly: false
    });

    const [filterMetadata, setFilterMetadata] = useState<{ items: string[], variants: Map<string, Set<string>> }>({ items: [], variants: new Map() });

    const fetchMetadata = async () => {
        try {
            const { data: invData } = await supabase
                .from('me_item_types')
                .select(`name, me_items(name, is_archived)`)
                .eq('is_archived', false);

            if (invData) {
                const itemsSet = new Set<string>();
                const varMap = new Map<string, Set<string>>();
                invData.forEach((row: any) => {
                    const baseItem = row.me_items && !Array.isArray(row.me_items) ? row.me_items : null;
                    if (!baseItem || baseItem.is_archived) return;

                    const iName = baseItem.name;
                    const vName = row.name;

                    itemsSet.add(iName);
                    if (!varMap.has(iName)) varMap.set(iName, new Set());
                    varMap.get(iName)!.add(vName);
                });
                setFilterMetadata({ items: Array.from(itemsSet).sort(), variants: varMap });
            }
        } catch (error) {
            console.error("Error fetching metadata for filters:", error);
        }
    };

    const filterOptions = useMemo(() => {
        const customers = new Set<string>();
        const items = new Set<string>(filterMetadata.items);
        const variants = new Map<string, Set<string>>();

        filterMetadata.variants.forEach((vSet, k) => {
            variants.set(k, new Set(vSet));
        });

        data.forEach(order => {
            customers.add(order.customer_name);
            order.items.forEach(item => {
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
    }, [data, filterMetadata]);

    const variantOptions = useMemo(() => {
        const options: { value: string, label: string }[] = [];
        filterOptions.variants.forEach((vSet, item) => {
            Array.from(vSet).sort().forEach(v => {
                options.push({ value: `${item}::${v}`, label: `${item} - ${v}` });
            });
        });
        return options.sort((a, b) => a.label.localeCompare(b.label));
    }, [filterOptions.variants]);

    useEffect(() => {
        fetchOrders();
        fetchMetadata();
        fetchPlaces();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters]);

    const fetchPlaces = async () => {
        const res = await getPlaces();
        if (res.success && res.data) {
            setPlaces(res.data);
        }
    };

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const { data: rows, error } = await supabase
                .from('me_orders')
                .select(`
                    id,
                    order_id,
                    created_at,
                    quantity,
                    pending,
                    done,
                    done_time,
                    place,
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

            const grouped = new Map<number, OrderInvoice>();
            rows?.forEach((row: any) => {
                const orderId = row.order_id;

                const customer = row.customers && !Array.isArray(row.customers) ? row.customers : { id: 'unknown', name: 'Unknown Customer' };
                const itemType = row.me_item_types && !Array.isArray(row.me_item_types) ? row.me_item_types : null;
                const baseItem = itemType?.me_items && !Array.isArray(itemType.me_items) ? itemType.me_items : { name: 'Unknown Item' };

                if (!grouped.has(orderId)) {
                    grouped.set(orderId, {
                        order_id: orderId,
                        date: row.created_at,
                        customer_id: customer.id,
                        customer_name: customer.name,
                        items: []
                    });
                }

                const item: OrderItem = {
                    id: row.id,
                    item_type_id: itemType?.id || 'unknown',
                    product_name: baseItem.name,
                    variant: itemType?.name || 'Standard',
                    quantity: row.quantity,
                    pending: row.pending || 0,
                    done: row.done,
                    done_time: row.done_time,
                    place: row.place
                };
                grouped.get(orderId)!.items.push(item);
            });

            setData(Array.from(grouped.values()));
        } catch (error: any) {
            console.error("Error fetching orders:", error?.message || error, error?.code, error?.details);
            setData([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateOrderPlace = async (orderId: number, place: string) => {
        try {
            const order = data.find(o => o.order_id === orderId);
            if (!order) return;

            await Promise.all(order.items.map(item => updateOrderItem(item.id, { place })));

            setData(prev => prev.map(o => o.order_id === orderId ? {
                ...o,
                items: o.items.map(item => ({ ...item, place }))
            } : o));
        } catch (error) {
            console.error("Error updating place:", error);
        }
    };

    const handleCreateOrderPlace = async (name: string, orderId?: number) => {
        try {
            const res = await createPlace(name);
            if (res.success && res.data) {
                setPlaces(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
                if (orderId) {
                    await handleUpdateOrderPlace(orderId, res.data.name);
                }
            } else {
                alert("Failed to create place: " + res.error);
            }
        } catch (err) {
            console.error("Error creating place", err);
        }
    };

    const handleDeleteOrder = async (orderId: number) => {
        if (!window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;
        try {
            const res = await deleteOrder(orderId);
            if (res.success) {
                fetchOrders();
            } else {
                alert(res.error || "Failed to delete order");
            }
        } catch (error) {
            console.error("Error deleting order:", error);
            alert("Failed to delete order");
        }
    };

    const filteredData = useMemo(() => {
        return data.filter(inv => {
            // Search Query (Customer or Order ID)
            const matchesSearch = inv.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                inv.order_id.toString().includes(searchQuery);
            if (!matchesSearch) return false;

            // Customer Filter
            if (filters.customer.length > 0 && !filters.customer.includes(inv.customer_name)) return false;

            // Item and Variant Filters
            const noItemVariantFilters = filters.item.length === 0 && filters.variant.length === 0;

            const matchesItems = inv.items.some(item => {
                const varKey = `${item.product_name}::${item.variant}`;
                const itemVariantMatch = noItemVariantFilters || filters.variant.includes(varKey);

                // Quantity Filters
                const minMatch = !filters.minQty || item.quantity >= Number(filters.minQty);
                const maxMatch = !filters.maxQty || item.quantity <= Number(filters.maxQty);

                // Pending Only Filter
                const pendingMatch = !filters.pendingOnly || item.pending > 0;

                return itemVariantMatch && minMatch && maxMatch && pendingMatch;
            });
            if (!matchesItems) return false;

            // Date Filters
            if (filters.startDate) {
                const start = new Date(filters.startDate);
                if (new Date(inv.date) < start) return false;
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                if (new Date(inv.date) > end) return false;
            }

            // Place Filter
            if (filters.place.length > 0) {
                const hasMatchingPlace = inv.items.some(item => item.place && filters.place.includes(item.place));
                if (!hasMatchingPlace) return false;
            }

            return true;
        });
    }, [searchQuery, data, filters]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleNewOrder = async (invoiceData: any) => {
        fetchOrders();
    };

    const exportColumns = [
        { key: 'order_id', label: 'Order ID' },
        { key: 'date', label: 'Date' },
        { key: 'customer', label: 'Customer' },
        { key: 'item', label: 'Item Name' },
        { key: 'variant', label: 'Variant' },
        { key: 'quantity', label: 'Total Qty' },
        { key: 'pending', label: 'Pending Qty' },
        { key: 'place', label: 'Place' },
        { key: 'status', label: 'Status' }
    ];

    const exportData = useMemo(() => {
        const rows: any[] = [];
        filteredData.forEach(order => {
            order.items.forEach(item => {
                rows.push({
                    order_id: order.order_id,
                    date: new Date(order.date).toLocaleDateString(),
                    customer: order.customer_name,
                    item: item.product_name,
                    variant: item.variant,
                    quantity: item.quantity,
                    pending: item.pending,
                    place: item.place || '',
                    status: (item.done || item.pending === 0) ? 'Completed' : 'Pending'
                });
            });
        });
        return rows;
    }, [filteredData]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your customer orders.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-3xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-80 group">
                            <Input
                                placeholder="Search customer or order ID..."
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
                        <Button variant="secondary" className="h-11 rounded-xl px-5 font-semibold" icon={Download} onClick={() => setIsExportModalOpen(true)}>
                            Export CSV
                        </Button>
                        <Button variant="primary" className="h-11 rounded-xl px-5 font-semibold" icon={Plus} onClick={() => setIsModalOpen(true)}>
                            New Order
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
                            <MultiSelect
                                values={filters.customer}
                                placeholder="All Customers"
                                onChange={(vals) => setFilters(f => {
                                    if (vals.length > 0) {
                                        const associatedPlaces = Array.from(new Set(
                                            data.filter(inv => vals.includes(inv.customer_name))
                                                .flatMap(inv => inv.items.map(i => i.place).filter(Boolean))
                                        )) as string[];
                                        return { ...f, customer: vals, place: associatedPlaces };
                                    } else {
                                        return { ...f, customer: [], place: [] };
                                    }
                                })}
                                options={filterOptions.customers.map(c => ({ value: c, label: c }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Plus size={12} /> Product
                            </label>
                            <MultiSelect
                                values={filters.item}
                                placeholder="All Products"
                                onChange={(vals) => {
                                    setFilters(f => {
                                        const addedItems = vals.filter(v => !f.item.includes(v));
                                        const removedItems = f.item.filter(v => !vals.includes(v));
                                        
                                        let newVariants = [...f.variant];
                                        
                                        addedItems.forEach(item => {
                                            const itemVariants = filterOptions.variants.get(item);
                                            if (itemVariants) {
                                                itemVariants.forEach(v => {
                                                    const varKey = `${item}::${v}`;
                                                    if (!newVariants.includes(varKey)) newVariants.push(varKey);
                                                });
                                            }
                                        });
                                        
                                        removedItems.forEach(item => {
                                            const itemVariants = filterOptions.variants.get(item);
                                            if (itemVariants) {
                                                itemVariants.forEach(v => {
                                                    const varKey = `${item}::${v}`;
                                                    newVariants = newVariants.filter(nv => nv !== varKey);
                                                });
                                            }
                                        });
                                        
                                        return { ...f, item: vals, variant: newVariants };
                                    });
                                }}
                                options={filterOptions.items.map(i => ({ value: i, label: i }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <ChevronDown size={12} /> Variant
                            </label>
                            <MultiSelect
                                values={filters.variant}
                                placeholder="All Variants"
                                onChange={(vals) => {
                                    setFilters(f => {
                                        const newItems = [...f.item];
                                        
                                        filterOptions.items.forEach(item => {
                                            const itemVariants = filterOptions.variants.get(item);
                                            if (itemVariants && itemVariants.size > 0) {
                                                const allSelected = Array.from(itemVariants).every(v => vals.includes(`${item}::${v}`));
                                                if (allSelected && !newItems.includes(item)) {
                                                    newItems.push(item);
                                                } else if (!allSelected && newItems.includes(item)) {
                                                    const idx = newItems.indexOf(item);
                                                    if (idx > -1) newItems.splice(idx, 1);
                                                }
                                            }
                                        });
                                        
                                        return { ...f, variant: vals, item: newItems };
                                    });
                                }}
                                options={variantOptions}
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


                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={12} /> Location
                            </label>
                            <MultiSelect
                                options={places.map(p => ({ value: p.name, label: p.name }))}
                                values={filters.place}
                                onChange={(vals) => setFilters(f => {
                                    if (vals.length > 0) {
                                        const associatedCustomers = Array.from(new Set(
                                            data.filter(inv => inv.items.some(i => i.place && vals.includes(i.place)))
                                                .map(inv => inv.customer_name)
                                        ));
                                        return { ...f, place: vals, customer: associatedCustomers };
                                    } else {
                                        return { ...f, place: [], customer: [] };
                                    }
                                })}
                            />
                        </div>

                        <div className="relative h-full min-h-[60px]">
                            <div className="space-y-3.5 pt-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    Order Status
                                </label>
                                <label className="relative flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={filters.pendingOnly}
                                        onChange={(e) => setFilters(f => ({ ...f, pendingOnly: e.target.checked }))}
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                                    <span className="ml-2 text-xs font-medium text-gray-600">
                                        {filters.pendingOnly ? 'Pending Only' : 'All Orders'}
                                    </span>
                                </label>
                            </div>
                            <div className="absolute bottom-1 right-0">
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 px-4 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-100/80 rounded-xl"
                                    onClick={() => setFilters({
                                        customer: [],
                                        item: [],
                                        variant: [],
                                        minQty: '',
                                        maxQty: '',
                                        startDate: '',
                                        endDate: '',
                                        place: [],
                                        pendingOnly: false
                                    })}
                                >
                                    Reset All Filters
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="sm:hidden">Order</TableHead>
                        <TableHead className="hidden sm:table-cell">Order ID</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="hidden sm:table-cell">Customer</TableHead>
                        <TableHead>Place</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="py-24 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
                                <span className="font-medium">Loading orders data...</span>
                            </TableCell>
                        </TableRow>
                    ) : paginatedData.length > 0 ? (
                        paginatedData.map((inv) => (
                            <OrderRow
                                key={inv.order_id}
                                order={inv}
                                places={places}
                                onUpdateOrderPlace={handleUpdateOrderPlace}
                                onCreateOrderPlace={handleCreateOrderPlace}
                                onEditOrder={(o) => {
                                    setEditOrder(o);
                                    setIsEditModalOpen(true);
                                }}
                                onDeleteOrder={handleDeleteOrder}
                            />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="py-12">
                                <EmptyState
                                    variant={searchQuery ? "no-results" : "no-data"}
                                    title={searchQuery ? "No orders found" : "No orders yet"}
                                    description="Record a new order to see it here."
                                    action={!searchQuery ? { label: "New Order", onClick: () => setIsModalOpen(true) } : undefined}
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
                        onItemsPerPageChange={(val) => {
                            setItemsPerPage(val);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            )}

            <OrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleNewOrder} />
            <EditOrderModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={fetchOrders}
                order={editOrder}
            />
            <GenericExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                data={exportData}
                columns={exportColumns}
                filenamePrefix="orders"
            />
        </div>
    );
}
