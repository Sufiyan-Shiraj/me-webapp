"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Select } from '@/components/ui/Select';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { Input } from '@/components/ui/Input';
import { Box, ArrowUpRight, Search, Package, X } from 'lucide-react';
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

export default function ActiveOrdersOverview({ initialItems = [] }: { initialItems?: RawOrderItem[] }) {
    const [rawItems, setRawItems] = useState<RawOrderItem[]>(initialItems);
    const [isLoading, setIsLoading] = useState(false); // Default to false since data comes from server

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState<'qty_high' | 'qty_low' | 'alpha_asc' | 'alpha_desc'>('qty_high');
    const [selectedCustomer, setSelectedCustomer] = useState<string[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<string[]>([]);
    const [isCustomersExpanded, setIsCustomersExpanded] = useState(false);
    const [isPlacesExpanded, setIsPlacesExpanded] = useState(false);

    // If initialItems change (e.g. re-navigating), update rawItems
    useEffect(() => {
        if (initialItems.length > 0) {
            setRawItems(initialItems);
        }
    }, [initialItems]);

    const groupedAndSorted = useMemo(() => {
        // 0. Pre-filter raw items
        let filteredRaw = [...rawItems];
        if (selectedCustomer.length > 0) {
            filteredRaw = filteredRaw.filter(item => selectedCustomer.includes(item.customer_name));
        }
        if (selectedPlace.length > 0) {
            filteredRaw = filteredRaw.filter(item => selectedPlace.includes(item.place));
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

    const renderPillValue = (items: string[], maxToShow: number = 2) => {
        if (items.length <= maxToShow) return items.join(', ');
        return `${items.slice(0, maxToShow).join(', ')} + ${items.length - maxToShow} more`;
    };

    return (
        <div className="space-y-4 h-full flex flex-col p-6">
            <div className="flex flex-col mb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-semibold tracking-wide text-foreground/60 uppercase">Total Pending Items</h3>
                        <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-medium mt-1">
                            Production / Fulfillment Required
                        </p>
                    </div>
                </div>
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
                        <MultiSelect
                            values={selectedCustomer}
                            placeholder="All Customers"
                            onChange={(vals: any) => {
                                setSelectedCustomer(vals);
                                if (vals.length > 0) {
                                    const associatedPlaces = Array.from(new Set(rawItems.filter(i => vals.includes(i.customer_name)).map(i => i.place)));
                                    setSelectedPlace(associatedPlaces);
                                } else {
                                    setSelectedPlace([]);
                                }
                            }}
                            options={uniqueCustomers.map(c => ({ value: c, label: c }))}
                        />
                    </div>

                    {/* Place Filter */}
                    <div className="w-full">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Location</label>
                        <MultiSelect
                            values={selectedPlace}
                            onChange={(vals: any) => {
                                setSelectedPlace(vals);
                                if (vals.length > 0) {
                                    const associatedCustomers = Array.from(new Set(rawItems.filter(i => vals.includes(i.place)).map(i => i.customer_name)));
                                    setSelectedCustomer(associatedCustomers);
                                } else {
                                    setSelectedCustomer([]);
                                }
                            }}
                            options={uniquePlaces.map(p => ({ value: p, label: p }))}
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

            {/* Active Filters Display */}
            {(searchQuery || selectedCustomer.length > 0 || selectedPlace.length > 0 || sortMode !== 'qty_high') && (
                <div className="flex flex-wrap items-center gap-2 px-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-1">Applied:</span>

                    {searchQuery && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/5 border border-border/20 rounded-xl text-xs font-medium text-foreground/80">
                            <span className="text-foreground/40">Search:</span> {searchQuery}
                            <button onClick={() => setSearchQuery('')} className="ml-1 text-foreground/40 hover:text-red-500"><X size={12} /></button>
                        </div>
                    )}

                    {selectedCustomer.length > 0 && (
                        <div
                            className="flex items-start gap-2 px-3 py-2 bg-foreground/5 border border-border/20 rounded-xl text-xs font-medium text-foreground/80 w-full sm:max-w-[400px] lg:max-w-[500px] cursor-pointer hover:bg-foreground/10 transition-colors"
                            onClick={() => setIsCustomersExpanded(!isCustomersExpanded)}
                        >
                            <span className="text-foreground/40 shrink-0 mt-0.5">Customers:</span>
                            <div className={`flex flex-wrap gap-1.5 pr-1 w-full ${!isCustomersExpanded ? 'max-h-6 overflow-hidden' : ''}`}>
                                {selectedCustomer.map(c => (
                                    <span key={c} className="bg-foreground/10 px-1.5 py-0.5 rounded-md leading-tight">{c}</span>
                                ))}
                            </div>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer([]);
                                if (selectedPlace.length > 0) setSelectedPlace([]);
                            }} className="ml-auto shrink-0 text-foreground/40 hover:text-red-500 mt-0.5"><X size={14} /></button>
                        </div>
                    )}

                    {selectedPlace.length > 0 && (
                        <div
                            className="flex items-start gap-2 px-3 py-2 bg-foreground/5 border border-border/20 rounded-xl text-xs font-medium text-foreground/80 w-full sm:max-w-[400px] lg:max-w-[500px] cursor-pointer hover:bg-foreground/10 transition-colors"
                            onClick={() => setIsPlacesExpanded(!isPlacesExpanded)}
                        >
                            <span className="text-foreground/40 shrink-0 mt-0.5">Locations:</span>
                            <div className={`flex flex-wrap gap-1.5 pr-1 w-full ${!isPlacesExpanded ? 'max-h-6 overflow-hidden' : ''}`}>
                                {selectedPlace.map(p => (
                                    <span key={p} className="bg-foreground/10 px-1.5 py-0.5 rounded-md leading-tight">{p}</span>
                                ))}
                            </div>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPlace([]);
                                if (selectedCustomer.length > 0) setSelectedCustomer([]);
                            }} className="ml-auto shrink-0 text-foreground/40 hover:text-red-500 mt-0.5"><X size={14} /></button>
                        </div>
                    )}

                    {sortMode !== 'qty_high' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/5 border border-border/20 rounded-xl text-xs font-medium text-foreground/80">
                            <span className="text-foreground/40">Sort:</span>
                            {sortMode === 'qty_low' ? 'Lowest Qty' : sortMode === 'alpha_asc' ? 'A-Z' : 'Z-A'}
                            <button onClick={() => setSortMode('qty_high')} className="ml-1 text-foreground/40 hover:text-red-500"><X size={12} /></button>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCustomer([]);
                            setSelectedPlace([]);
                            setSortMode('qty_high');
                        }}
                        className="text-[10px] font-bold text-red-500 hover:text-red-600 hover:underline ml-2 uppercase tracking-wider"
                    >
                        Clear All
                    </button>
                </div>
            )}

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
