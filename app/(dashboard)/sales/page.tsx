"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { TablePagination } from '@/components/ui/TablePagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, FileText, Download, Trash2, Box, Edit2, Filter, X, ChevronDown, Calendar, Hash, MapPin } from 'lucide-react';
import { Sale, SaleItem } from '@/lib/types';
import clsx from 'clsx';
import styles from '@/components/ui/ui.module.css';
import { NewSaleModal } from '../../../components/sales/NewSaleModal';
import { GenericExportModal } from '@/components/ui/GenericExportModal';
import { Select } from '@/components/ui/Select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { getPlaces } from '@/lib/actions/placesActions';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/lib/supabase';
import { deleteSaleShipment } from '@/lib/actions/newSalesActions';

// Update local type to include the new fields we need
interface ExtendedSaleItem extends SaleItem {
    order_id: number;
    place: string;
    date: string;
}

interface ExtendedSale extends Sale {
    items: ExtendedSaleItem[];
}

interface SaleRowProps {
    sale: ExtendedSale;
    onDeleteSale?: (saleId: number) => void;
    onEditSale?: (sale: ExtendedSale) => void;
}

const SaleRow = ({ sale, onDeleteSale, onEditSale }: SaleRowProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const locations = useMemo(() => {
        const places = new Set<string>();
        sale.items.forEach(item => {
            if (item.place) places.add(item.place);
        });
        const arr = Array.from(places);
        if (arr.length === 0) return 'No Location';
        if (arr.length <= 2) return arr.join(', ');
        return `${arr[0]}, ${arr[1]} +${arr.length - 2}`;
    }, [sale.items]);

    const groupedItems = useMemo(() => {
        const groupsMap = new Map<number, {
            order_id: number;
            date: string;
            place: string;
            items: ExtendedSaleItem[];
        }>();

        sale.items.forEach(item => {
            if (!groupsMap.has(item.order_id)) {
                groupsMap.set(item.order_id, {
                    order_id: item.order_id,
                    date: item.date,
                    place: item.place,
                    items: []
                });
            }
            groupsMap.get(item.order_id)!.items.push(item);
        });

        return Array.from(groupsMap.values());
    }, [sale.items]);

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
                            <span className="font-bold text-gray-900">{sale.customer_name}</span>
                            <span className="text-xs text-gray-500 font-mono mt-0.5">#{sale.sale_id} • {new Date(sale.created_at).toLocaleDateString()}</span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{sale.items.reduce((acc, curr) => acc + curr.quantity, 0)} items</span>
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
                        #{sale.sale_id}
                    </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-gray-600 text-sm">{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="hidden sm:table-cell font-medium text-foreground group-hover:text-gray-900 transition-colors">{sale.customer_name}</TableCell>
                <TableCell className="hidden sm:table-cell text-gray-600 font-mono text-sm">{sale.items.reduce((acc, curr) => acc + curr.quantity, 0)} items</TableCell>
                
                {/* Always visible cells */}
                <TableCell className="text-gray-600 text-sm max-w-[120px] sm:max-w-none truncate" title={locations}>{locations}</TableCell>
                <TableCell className="text-right px-2 sm:px-4" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1 sm:gap-2 opacity-100 sm:opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:text-accent hover:bg-accent/10 rounded-full" title="View details" onClick={() => setIsOpen(!isOpen)}>
                            <FileText size={16} className="sm:w-[20px] sm:h-[20px]" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:text-blue-600 hover:bg-blue-50 rounded-full" title="Edit Shipment" onClick={() => onEditSale?.(sale)}>
                            <Edit2 size={16} className="sm:w-[20px] sm:h-[20px]" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:text-destructive hover:bg-destructive/10 rounded-full" title="Delete Sale" onClick={() => onDeleteSale?.(sale.sale_id)}>
                            <Trash2 size={16} className="sm:w-[20px] sm:h-[20px]" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>

            {/* Expandable Items Row */}
            <AnimatePresence>
                {isOpen && (
                    <TableRow className="bg-accent/[0.02] border-l-2 border-accent border-b-0 hover:bg-accent/[0.02]">
                        <TableCell colSpan={6} className="p-0 border-b-0">
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="p-3 sm:p-6 md:px-12 py-4 sm:py-6 overflow-x-auto">
                                    <div className="flex items-center justify-between mb-4 px-1 sm:px-2">
                                        <h4 className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fulfilled Orders in Shipment</h4>
                                        <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Shipped Qty</span>
                                    </div>
                                    <div className="space-y-4 max-h-[40vh] overflow-y-auto custom-scrollbar px-1 sm:px-2 pb-2">
                                        {groupedItems.map((group) => (
                                            <div key={group.order_id} className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 flex flex-col shadow-sm">
                                                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                        <span className="text-[10px] sm:text-xs font-mono font-bold text-gray-600 bg-gray-100 px-1.5 sm:px-2 py-1 rounded">
                                                            Order #{group.order_id}
                                                        </span>
                                                        <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium">
                                                            {new Date(group.date).toLocaleDateString()}
                                                        </span>
                                                        {group.place && <span className="text-[9px] text-gray-400 uppercase tracking-wide bg-gray-100 px-1.5 py-0.5 rounded">{group.place}</span>}
                                                    </div>
                                                    <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 sm:gap-2">
                                                        Total <span className="hidden sm:inline">Items</span> <span className="text-sm font-mono text-gray-900">{group.items.reduce((acc, curr) => acc + curr.quantity, 0)}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    {group.items.map((item) => (
                                                        <div key={item.id} className="flex justify-between items-center pl-1 sm:pl-2">
                                                            <div className="flex-1 flex flex-col pr-2">
                                                                <span className="text-sm font-semibold text-gray-900">{item.product_name}</span>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-gray-500 font-medium">{item.variant}</span>
                                                                </div>
                                                            </div>
                                                            <div className="w-[60px] flex justify-end items-center pr-1 sm:pr-2">
                                                                <span className="text-sm font-mono font-bold text-gray-900">{item.quantity}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
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

export default function ShipmentsPage() {
    const [data, setData] = useState<ExtendedSale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSaleToEdit, setSelectedSaleToEdit] = useState<ExtendedSale | null>(null);
    const [places, setPlaces] = useState<{id: string, name: string}[]>([]);
    
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
        place: [] as string[]
    });

    const [filterMetadata, setFilterMetadata] = useState<{items: string[], variants: Map<string, Set<string>>}>({ items: [], variants: new Map() });

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

        data.forEach(sale => {
            if (sale.customer_name) customers.add(sale.customer_name);
            sale.items.forEach(item => {
                if (item.product_name) {
                    items.add(item.product_name);
                    if (!variants.has(item.product_name)) {
                        variants.set(item.product_name, new Set());
                    }
                    if (item.variant) {
                        variants.get(item.product_name)!.add(item.variant);
                    }
                }
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

    const fetchPlaces = async () => {
        const res = await getPlaces();
        if (res.success && res.data) {
            setPlaces(res.data);
        }
    };

    useEffect(() => {
        fetchSales();
        fetchMetadata();
        fetchPlaces();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters]);

    const fetchSales = async () => {
        setIsLoading(true);
        try {
            const { data: rows, error } = await supabase
                .from('me_sales')
                .select(`
                    id,
                    sale_id,
                    created_at,
                    customers ( id, name ),
                    me_sale_items (
                        id,
                        quantity,
                        me_orders (
                            id,
                            order_id,
                            place,
                            created_at,
                            me_item_types (
                                name,
                                me_items ( name )
                            )
                        )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const salesData = rows?.map((row: any) => {
                const customer = row.customers && !Array.isArray(row.customers) ? row.customers : { name: 'Unknown Customer' };
                
                const items: ExtendedSaleItem[] = row.me_sale_items?.map((itemRow: any) => {
                    const order = itemRow.me_orders && !Array.isArray(itemRow.me_orders) ? itemRow.me_orders : null;
                    const itemType = order?.me_item_types && !Array.isArray(order.me_item_types) ? order.me_item_types : null;
                    const baseItem = itemType?.me_items && !Array.isArray(itemType.me_items) ? itemType.me_items : null;

                    return {
                        id: itemRow.id,
                        sale_id: row.id,
                        order_item_id: order?.id || 'unknown', 
                        quantity: itemRow.quantity,
                        product_name: baseItem?.name || 'Unknown Product',
                        variant: itemType?.name || 'Standard',
                        order_id: order?.order_id || 0,
                        place: order?.place || '',
                        date: order?.created_at || row.created_at
                    };
                }) || [];

                return {
                    id: row.id,
                    sale_id: row.sale_id,
                    created_at: row.created_at,
                    customer_id: customer.id,
                    customer_name: customer.name,
                    items
                };
            }) || [];

            setData(salesData as unknown as ExtendedSale[]);
        } catch (error: any) {
            console.error("Error fetching shipments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSale = async (saleId: number) => {
        if (!confirm(`Are you sure you want to delete Shipment #${saleId}? The pending quantities on the original orders will be restored.`)) return;

        try {
            const res = await deleteSaleShipment(saleId);
            if (!res.success) throw new Error(res.error);
            
            setData(prev => prev.filter(sale => sale.sale_id !== saleId));
        } catch (error: any) {
            console.error("Error deleting shipment:", error);
            alert(error.message || "Failed to delete shipment.");
        }
    };

    const handleEditSale = (sale: ExtendedSale) => {
        setSelectedSaleToEdit(sale);
        setIsEditModalOpen(true);
    };

    const filteredData = useMemo(() => {
        return data.filter(sale => {
            // Search Query
            const matchesSearch = !searchQuery || 
                sale.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                sale.sale_id.toString().includes(searchQuery);
            if (!matchesSearch) return false;

            // Customer Filter
            if (filters.customer.length > 0 && (!sale.customer_name || !filters.customer.includes(sale.customer_name))) return false;

            // Item and Variant Filters
            const noItemVariantFilters = filters.item.length === 0 && filters.variant.length === 0;

            const matchesItems = sale.items.some(item => {
                const varKey = `${item.product_name}::${item.variant}`;
                const itemVariantMatch = noItemVariantFilters || filters.variant.includes(varKey);
                
                // Quantity Filters
                const minMatch = !filters.minQty || item.quantity >= Number(filters.minQty);
                const maxMatch = !filters.maxQty || item.quantity <= Number(filters.maxQty);

                return itemVariantMatch && minMatch && maxMatch;
            });
            if (!matchesItems) return false;

            // Date Filters
            if (filters.startDate) {
                const start = new Date(filters.startDate);
                if (new Date(sale.created_at) < start) return false;
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                if (new Date(sale.created_at) > end) return false;
            }

            // Place Filter
            if (filters.place.length > 0) {
                const hasMatchingPlace = sale.items.some(item => item.place && filters.place.includes(item.place));
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

    const exportColumns = [
        { key: 'sale_id', label: 'Shipment ID' },
        { key: 'sale_date', label: 'Shipment Date' },
        { key: 'customer', label: 'Customer' },
        { key: 'order_id', label: 'Fulfilled Order ID' },
        { key: 'order_date', label: 'Order Date' },
        { key: 'place', label: 'Location' },
        { key: 'item', label: 'Item Name' },
        { key: 'variant', label: 'Variant' },
        { key: 'quantity', label: 'Quantity Sent' }
    ];

    const exportData = useMemo(() => {
        const rows: any[] = [];
        filteredData.forEach(sale => {
            sale.items.forEach(item => {
                rows.push({
                    sale_id: sale.sale_id,
                    sale_date: new Date(sale.created_at).toLocaleDateString(),
                    customer: sale.customer_name,
                    order_id: item.order_id,
                    order_date: new Date(item.date).toLocaleDateString(),
                    place: item.place,
                    item: item.product_name,
                    variant: item.variant,
                    quantity: item.quantity
                });
            });
        });
        return rows;
    }, [filteredData]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shipments (Sales)</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your fulfilled orders.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 rounded-3xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-80 group">
                            <Input
                                placeholder="Search customer or shipment ID..."
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
                        <Button variant="primary" className="h-11 rounded-xl px-5 font-semibold" icon={Box} onClick={() => { setSelectedSaleToEdit(null); setIsModalOpen(true); }}>
                            Create Shipment
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
                                            data.filter(inv => inv.customer_name && vals.includes(inv.customer_name))
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
                                                .filter(Boolean)
                                        )) as string[];
                                        return { ...f, place: vals, customer: associatedCustomers };
                                    } else {
                                        return { ...f, place: [], customer: [] };
                                    }
                                })}
                            />
                        </div>

                        <div className="flex items-end justify-end gap-3">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-10 px-6 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-100/80 rounded-xl"
                                onClick={() => setFilters({
                                    customer: [],
                                    item: [],
                                    variant: [],
                                    minQty: '',
                                    maxQty: '',
                                    startDate: '',
                                    endDate: '',
                                    place: []
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
                        <TableHead className="sm:hidden">Shipment</TableHead>
                        <TableHead className="hidden sm:table-cell">Shipment ID</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="hidden sm:table-cell">Customer</TableHead>
                        <TableHead className="hidden sm:table-cell">Total Items</TableHead>
                        <TableHead>Locations</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="py-24 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
                                <span className="font-medium">Loading shipments...</span>
                            </TableCell>
                        </TableRow>
                    ) : paginatedData.length > 0 ? (
                        paginatedData.map((sale) => (
                            <SaleRow
                                key={sale.sale_id}
                                sale={sale}
                                onDeleteSale={handleDeleteSale}
                                onEditSale={handleEditSale}
                            />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="py-12">
                                <EmptyState
                                    variant={searchQuery ? "no-results" : "no-data"}
                                    title={searchQuery ? "No shipments found" : "No shipments yet"}
                                    description="Create a shipment from pending orders."
                                    action={!searchQuery ? { label: "Create Shipment", onClick: () => { setSelectedSaleToEdit(null); setIsModalOpen(true); } } : undefined}
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

            <NewSaleModal 
                isOpen={isModalOpen || isEditModalOpen} 
                onClose={() => { setIsModalOpen(false); setIsEditModalOpen(false); setSelectedSaleToEdit(null); }} 
                onSubmit={fetchSales} 
                editSale={selectedSaleToEdit} 
            />
            <GenericExportModal 
                isOpen={isExportModalOpen} 
                onClose={() => setIsExportModalOpen(false)} 
                data={exportData} 
                columns={exportColumns}
                filenamePrefix="shipments"
            />
        </div>
    );
}
