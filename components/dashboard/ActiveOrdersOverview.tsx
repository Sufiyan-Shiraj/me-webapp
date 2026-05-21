"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { OrderItem } from '@/lib/types';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapPin, ArrowUpRight, ArrowDownRight, Search, Navigation } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// Distance mapping from Edathala (Ernakulam) in km
const DISTANCES: Record<string, number> = {
    'Ernakulam': 0,
    'Thrissur': 60,
    'Kottayam': 65,
    'Alappuzha': 70,
    'Idukki': 100,
    'Palakkad': 120,
    'Pathanamthitta': 125,
    'Malappuram': 140,
    'Kollam': 150,
    'Kozhikode': 170,
    'Thiruvananthapuram': 210,
    'Wayanad': 240,
    'Kannur': 260,
    'Kasaragod': 350
};

const KERALA_DISTRICTS = Object.keys(DISTANCES).sort();

interface ActiveOrderRow {
    id: string;
    order_id: number;
    created_at: string;
    customer_name: string;
    customer_district: string;
    product_name: string;
    variant: string;
    pending_quantity: number;
    place: string;
}

export default function ActiveOrdersOverview() {
    const [orders, setOrders] = useState<ActiveOrderRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [sortMode, setSortMode] = useState<'latest' | 'oldest' | 'nearest' | 'furthest' | 'qty_high' | 'qty_low'>('latest');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
    const [includeOnRoute, setIncludeOnRoute] = useState(false);

    useEffect(() => {
        fetchActiveOrders();
    }, []);

    const fetchActiveOrders = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('me_orders')
                .select(`
                    id,
                    order_id,
                    created_at,
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

            const formatted: ActiveOrderRow[] = data.map((row: any) => {
                const customer = row.customers && !Array.isArray(row.customers) ? row.customers : { name: 'Unknown', district: 'Ernakulam' };
                const itemType = row.me_item_types && !Array.isArray(row.me_item_types) ? row.me_item_types : null;
                const baseItem = itemType?.me_items && !Array.isArray(itemType.me_items) ? itemType.me_items : { name: 'Unknown' };

                return {
                    id: row.id,
                    order_id: row.order_id,
                    created_at: row.created_at,
                    customer_name: customer.name,
                    customer_district: customer.district || 'Ernakulam',
                    product_name: baseItem.name,
                    variant: itemType?.name || 'Standard',
                    pending_quantity: row.pending,
                    place: row.place || customer.district || 'Ernakulam'
                };
            });

            setOrders(formatted);
        } catch (error) {
            console.error("Error fetching active orders:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const groupedAndSorted = useMemo(() => {
        let result = [...orders];

        // 1. Search Filter
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(o =>
                o.customer_name.toLowerCase().includes(lower) ||
                o.order_id.toString().includes(lower) ||
                o.place.toLowerCase().includes(lower) ||
                o.product_name.toLowerCase().includes(lower)
            );
        }

        // 2. District Filter & On-Route Logic
        if (selectedDistrict !== 'all') {
            const targetDistricts = [selectedDistrict];

            // If "Include On-Route (Thrissur)" is checked and selecting a northern district
            if (includeOnRoute && ['Palakkad', 'Kozhikode', 'Wayanad', 'Malappuram', 'Kannur', 'Kasaragod'].includes(selectedDistrict)) {
                targetDistricts.push('Thrissur');
            }

            result = result.filter(o => {
                const orderLocation = o.place;
                return targetDistricts.some(td => orderLocation.toLowerCase().includes(td.toLowerCase()) || o.customer_district === td);
            });
        }

        // Group by order_id
        const groupsMap = new Map<number, {
            order_id: number;
            created_at: string;
            customer_name: string;
            customer_district: string;
            place: string;
            total_pending: number;
            items: ActiveOrderRow[];
        }>();

        result.forEach(item => {
            if (!groupsMap.has(item.order_id)) {
                groupsMap.set(item.order_id, {
                    order_id: item.order_id,
                    created_at: item.created_at,
                    customer_name: item.customer_name,
                    customer_district: item.customer_district,
                    place: item.place,
                    total_pending: 0,
                    items: []
                });
            }
            const group = groupsMap.get(item.order_id)!;
            group.items.push(item);
            group.total_pending += item.pending_quantity;
        });

        let groupedArray = Array.from(groupsMap.values());

        // 3. Sorting
        groupedArray.sort((a, b) => {
            if (sortMode === 'latest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sortMode === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            if (sortMode === 'qty_high') return b.total_pending - a.total_pending;
            if (sortMode === 'qty_low') return a.total_pending - b.total_pending;

            // Distance sorting (Nearest/Furthest to Edathala/Ernakulam)
            if (sortMode === 'nearest' || sortMode === 'furthest') {
                const getDistance = (place: string, district: string) => {
                    const matchedDistrict = KERALA_DISTRICTS.find(d => place.toLowerCase().includes(d.toLowerCase())) || district;
                    return DISTANCES[matchedDistrict] ?? 999;
                };

                const distA = getDistance(a.place, a.customer_district);
                const distB = getDistance(b.place, b.customer_district);

                if (sortMode === 'nearest') return distA - distB;
                if (sortMode === 'furthest') return distB - distA;
            }
            return 0;
        });

        return groupedArray;
    }, [orders, searchQuery, sortMode, selectedDistrict, includeOnRoute]);

    const showOnRouteOption = ['Palakkad', 'Kozhikode', 'Wayanad', 'Malappuram', 'Kannur', 'Kasaragod'].includes(selectedDistrict);

    return (
        <div className="space-y-4 h-full flex flex-col p-6">
            <div className="flex flex-col mb-2">
                <Link href="/orders" className="group flex items-center justify-between no-underline">
                    <div>
                        <h3 className="text-sm font-semibold tracking-wide text-foreground/60 uppercase group-hover:text-accent transition-colors">Active Orders</h3>
                        <p className="text-[10px] text-foreground/40 uppercase tracking-widest font-medium mt-1">
                            Pending Shipments
                        </p>
                    </div>
                    <ArrowUpRight size={16} className="text-foreground/40 group-hover:text-accent transition-colors" />
                </Link>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4 items-end justify-between bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">

                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative group w-full">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Search</label>
                        <div className="relative">
                            <Input
                                placeholder="Order ID, Customer..."
                                className="pl-9 h-10 bg-gray-50 border-gray-200 rounded-xl w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        </div>
                    </div>

                    {/* District Filter */}
                    <div className="w-full">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Route Filter</label>
                        <Select
                            value={selectedDistrict}
                            onChange={setSelectedDistrict}
                            options={[
                                { value: 'all', label: 'All Districts' },
                                ...KERALA_DISTRICTS.map(d => ({ value: d, label: d }))
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
                                { value: 'latest', label: 'Latest First' },
                                { value: 'oldest', label: 'Oldest First' },
                                { value: 'nearest', label: 'Nearest (Edathala)' },
                                { value: 'furthest', label: 'Furthest (Edathala)' },
                                { value: 'qty_high', label: 'Highest Qty' },
                                { value: 'qty_low', label: 'Lowest Qty' }
                            ]}
                        />
                    </div>

                    {/* On-Route Toggle */}
                    <AnimatePresence>
                        {showOnRouteOption && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full flex flex-col justify-end"
                            >
                                <label className="block text-[10px] font-bold text-transparent uppercase tracking-widest mb-1.5 select-none">.</label>
                                <label className="flex items-center gap-2 cursor-pointer h-10 px-3 bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-xl transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={includeOnRoute}
                                        onChange={(e) => setIncludeOnRoute(e.target.checked)}
                                        className="w-4 h-4 rounded text-accent focus:ring-accent accent-accent"
                                    />
                                    <span className="text-sm font-semibold text-accent flex items-center gap-1">
                                        <Navigation size={14} /> Include Thrissur
                                    </span>
                                </label>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* List View */}
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="py-24 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading active orders...</p>
                    </div>
                ) : groupedAndSorted.length === 0 ? (
                    <div className="py-24 text-center text-gray-500">
                        <MapPin className="mx-auto mb-4 opacity-20" size={48} />
                        <p className="font-medium text-lg">No active orders found.</p>
                        <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-4 bg-gray-50/30">
                        {groupedAndSorted.map((group) => {
                            const matchedDistrict = KERALA_DISTRICTS.find(d => group.place.toLowerCase().includes(d.toLowerCase())) || group.customer_district;
                            const distance = DISTANCES[matchedDistrict] ?? 0;

                            return (
                                <motion.div
                                    key={`${group.order_id}`}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col"
                                >
                                    {/* Group Header */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-100 mb-4 gap-3">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                #{group.order_id}
                                            </span>
                                            <h4 className="font-bold text-gray-900 text-sm">{group.customer_name}</h4>
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                {new Date(group.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1 font-medium bg-gray-100 px-2 py-0.5 rounded-md text-[11px]">
                                                <MapPin size={12} className="text-gray-400" />
                                                {group.place}
                                                {distance > 0 && <span className="text-gray-400 text-[10px] ml-1">({distance}km)</span>}
                                            </span>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                Pending <span className="text-sm font-mono text-orange-500">{group.total_pending}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="space-y-3">
                                        {group.items.map((item) => (
                                            <div key={item.id} className="grid grid-cols-12 gap-4 items-center pl-2">
                                                <div className="col-span-8 flex flex-col">
                                                    <span className="text-sm font-semibold text-gray-900">{item.product_name}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-gray-500 font-medium">{item.variant}</span>
                                                    </div>
                                                </div>
                                                <div className="col-span-4 flex justify-end items-center pr-2">
                                                    <span className="text-sm font-mono font-bold text-orange-500">{item.pending_quantity}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
