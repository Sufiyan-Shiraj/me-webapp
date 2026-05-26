"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Box, ArrowUpRight, Search, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RawOrderItem {
    product_name: string;
    variant: string;
    pending: number;
    customer_name: string;
    place: string;
}

interface AggregatedVariant {
    variant: string;
    total_pending: number;
}

interface AggregatedItem {
    product_name: string;
    total_pending: number;
    variants: AggregatedVariant[];
}

export default function ActiveOrdersOverview() {
    const [rawItems, setRawItems] = useState<RawOrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState<'qty_high' | 'qty_low' | 'alpha_asc' | 'alpha_desc'>('qty_high');
    const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
    const [selectedPlace, setSelectedPlace] = useState<string>('all');

    useEffect(() => {
        fetchPendingItems();
    }, []);

    const fetchPendingItems = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('me_orders')
                .select(`
                    pending,
                    place,
                    customers ( name, district ),
                    me_item_types (
                        name,
                        me_items ( name )
                    )
                `)
                .gt('pending', 0);

            if (error) throw error;

            const formatted: RawOrderItem[] = data.map((row: any) => {
                const customer = row.customers && !Array.isArray(row.customers) ? row.customers : { name: 'Unknown', district: 'Ernakulam' };
                const itemType = row.me_item_types && !Array.isArray(row.me_item_types) ? row.me_item_types : null;
                const baseItem = itemType?.me_items && !Array.isArray(itemType.me_items) ? itemType.me_items : { name: 'Unknown' };

                return {
                    product_name: baseItem.name,
                    variant: itemType?.name || 'Standard',
                    pending: row.pending,
                    customer_name: customer.name,
                    place: row.place || customer.district || 'Ernakulam'
                };
            });

            setRawItems(formatted);
        } catch (error) {
            console.error("Error fetching pending items:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const groupedAndSorted = useMemo(() => {
        // 0. Pre-filter raw items
        let filteredRaw = [...rawItems];
        if (selectedCustomer !== 'all') {
            filteredRaw = filteredRaw.filter(item => item.customer_name === selectedCustomer);
        }
        if (selectedPlace !== 'all') {
            filteredRaw = filteredRaw.filter(item => item.place === selectedPlace);
        }

        // 1. Aggregate
        const groupsMap = new Map<string, AggregatedItem>();

        filteredRaw.forEach(item => {
            if (!groupsMap.has(item.product_name)) {
                groupsMap.set(item.product_name, {
                    product_name: item.product_name,
                    total_pending: 0,
                    variants: []
                });
            }
            const group = groupsMap.get(item.product_name)!;
            group.total_pending += item.pending;

            const existingVariant = group.variants.find(v => v.variant === item.variant);
            if (existingVariant) {
                existingVariant.total_pending += item.pending;
            } else {
                group.variants.push({ variant: item.variant, total_pending: item.pending });
            }
        });

        let aggregatedArray = Array.from(groupsMap.values());

        // 2. Search Filter
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            aggregatedArray = aggregatedArray.filter(o =>
                o.product_name.toLowerCase().includes(lower) ||
                o.variants.some(v => v.variant.toLowerCase().includes(lower))
            );
        }

        // 3. Sorting (sort variants within items, then sort items)
        aggregatedArray.forEach(group => {
            group.variants.sort((a, b) => b.total_pending - a.total_pending);
        });

        aggregatedArray.sort((a, b) => {
            if (sortMode === 'qty_high') return b.total_pending - a.total_pending;
            if (sortMode === 'qty_low') return a.total_pending - b.total_pending;
            if (sortMode === 'alpha_asc') return a.product_name.localeCompare(b.product_name);
            if (sortMode === 'alpha_desc') return b.product_name.localeCompare(a.product_name);
            return 0;
        });

        return aggregatedArray;
    }, [rawItems, searchQuery, sortMode, selectedCustomer, selectedPlace]);

    // Unique customers and places for filters
    const uniqueCustomers = useMemo(() => Array.from(new Set(rawItems.map(i => i.customer_name))).sort(), [rawItems]);
    const uniquePlaces = useMemo(() => Array.from(new Set(rawItems.map(i => i.place))).sort(), [rawItems]);

    return (
        <div className="space-y-4 h-full flex flex-col p-6">
            <div className="flex flex-col mb-2">
                <Link href="/orders" className="group flex items-center justify-between no-underline">
                    <div>
                        <h3 className="text-sm font-semibold tracking-wide text-foreground/60 uppercase group-hover:text-accent transition-colors">Total Pending Items</h3>
                        <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-medium mt-1">
                            Production / Fulfillment Required
                        </p>
                    </div>
                    <ArrowUpRight size={16} className="text-foreground/40 group-hover:text-accent transition-colors" />
                </Link>
            </div>
            
            <div className="flex flex-col gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative group w-full">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Search</label>
                        <div className="relative">
                            <Input
                                placeholder="Search products..."
                                className="pl-9 h-10 bg-gray-50 border-gray-200 rounded-xl w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        </div>
                    </div>

                    {/* Customer Filter */}
                    <div className="w-full">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Customer</label>
                        <Select
                            value={selectedCustomer}
                            onChange={(val: any) => setSelectedCustomer(val)}
                            options={[
                                { value: 'all', label: 'All Customers' },
                                ...uniqueCustomers.map(c => ({ value: c, label: c }))
                            ]}
                        />
                    </div>

                    {/* Place Filter */}
                    <div className="w-full">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Location</label>
                        <Select
                            value={selectedPlace}
                            onChange={(val: any) => setSelectedPlace(val)}
                            options={[
                                { value: 'all', label: 'All Locations' },
                                ...uniquePlaces.map(p => ({ value: p, label: p }))
                            ]}
                        />
                    </div>

                    {/* Sort Options */}
                    <div className="w-full">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Sort By</label>
                        <Select
                            value={sortMode}
                            onChange={(val: any) => setSortMode(val)}
                            options={[
                                { value: 'qty_high', label: 'Highest Qty' },
                                { value: 'qty_low', label: 'Lowest Qty' },
                                { value: 'alpha_asc', label: 'Alphabetical (A-Z)' },
                                { value: 'alpha_desc', label: 'Alphabetical (Z-A)' }
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* List View */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden flex-1 flex flex-col">
                {isLoading ? (
                    <div className="py-24 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading pending items...</p>
                    </div>
                ) : groupedAndSorted.length === 0 ? (
                    <div className="py-24 text-center text-gray-500">
                        <Box className="mx-auto mb-4 opacity-20" size={48} />
                        <p className="font-medium text-lg">No pending items found.</p>
                        <p className="text-sm mt-1">All orders are currently fulfilled or search yielded no results.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-4 bg-gray-50/30">
                        <AnimatePresence>
                            {groupedAndSorted.map((group) => (
                                <motion.div
                                    key={group.product_name}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col relative overflow-hidden"
                                >
                                    {/* Accent strip */}
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/20" />
                                    
                                    {/* Group Header */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 mb-4 gap-3 pl-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 rounded-lg">
                                                <Package size={18} className="text-gray-400" />
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-base">{group.product_name}</h4>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            Total Needed <span className="text-base font-mono text-orange-500">{group.total_pending}</span>
                                        </div>
                                    </div>

                                    {/* Variants List */}
                                    <div className="space-y-2 pl-2">
                                        {group.variants.map((variant) => (
                                            <div key={variant.variant} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                                <span className="text-sm font-medium text-gray-600">{variant.variant}</span>
                                                <span className="text-sm font-mono font-bold text-gray-900">{variant.total_pending}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
