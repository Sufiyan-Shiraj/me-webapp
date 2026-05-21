"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { Select } from '@/components/ui/Select';
import { createSale } from '@/lib/actions/newSalesActions';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';

interface NewSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
}

interface PendingOrderItem {
    id: string;
    order_id: number;
    date: string;
    product_name: string;
    variant: string;
    total_quantity: number;
    pending_quantity: number;
    place: string;
    fulfillment: number;
}

const DISTANCES_TO_EDATHALA: Record<string, number> = {
    'Ernakulam': 0,
    'Thrissur': 60,
    'Kottayam': 70,
    'Alappuzha': 70,
    'Idukki': 100,
    'Pathanamthitta': 110,
    'Palakkad': 130,
    'Kollam': 140,
    'Malappuram': 150,
    'Kozhikode': 180,
    'Thiruvananthapuram': 200,
    'Wayanad': 250,
    'Kannur': 260,
    'Kasaragod': 350
};

export function NewSaleModal({ isOpen, onClose, onSubmit }: NewSaleModalProps) {
    const [customers, setCustomers] = useState<{id: string, name: string}[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [pendingItems, setPendingItems] = useState<PendingOrderItem[]>([]);
    const [isFetching, setIsFetching] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date-asc'); // date-asc, date-desc, qty-desc, qty-asc, dist-desc, dist-asc

    useEffect(() => {
        if (isOpen) {
            fetchCustomers();
            setSelectedCustomer('');
            setPendingItems([]);
            setSearchQuery('');
            setSortBy('date-asc');
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedCustomer) {
            fetchPendingOrders(selectedCustomer);
        } else {
            setPendingItems([]);
        }
    }, [selectedCustomer]);

    const fetchCustomers = async () => {
        setIsFetching(true);
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('id, name')
                .eq('is_archived', false)
                .order('name');
            if (data) setCustomers(data);
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const fetchPendingOrders = async (customerId: string) => {
        setIsFetching(true);
        try {
            const { data: orders, error } = await supabase
                .from('me_orders')
                .select(`
                    id,
                    order_id,
                    created_at,
                    quantity,
                    pending,
                    place,
                    me_item_types (
                        name,
                        me_items ( name )
                    )
                `)
                .eq('customer_id', customerId)
                .gt('pending', 0);

            if (error) throw error;

            const items: PendingOrderItem[] = orders?.map((row: any) => {
                const itemType = row.me_item_types && !Array.isArray(row.me_item_types) ? row.me_item_types : null;
                const baseItem = itemType?.me_items && !Array.isArray(itemType.me_items) ? itemType.me_items : null;

                return {
                    id: row.id,
                    order_id: row.order_id,
                    date: row.created_at,
                    product_name: baseItem?.name || 'Unknown',
                    variant: itemType?.name || 'Standard',
                    total_quantity: row.quantity,
                    pending_quantity: row.pending,
                    place: row.place || '',
                    fulfillment: 0
                };
            }) || [];

            setPendingItems(items);
        } catch (error) {
            console.error("Error fetching pending orders:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleFulfillmentChange = (id: string, value: string) => {
        const val = parseInt(value) || 0;
        setPendingItems(prev => prev.map(item => {
            if (item.id === id) {
                const safeVal = Math.max(0, Math.min(val, item.pending_quantity));
                return { ...item, fulfillment: safeVal };
            }
            return item;
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCustomer) {
            alert("Please select a customer.");
            return;
        }

        const itemsToFulfill = pendingItems.filter(item => item.fulfillment > 0);
        if (itemsToFulfill.length === 0) {
            alert("Please specify fulfillment quantity for at least one item.");
            return;
        }

        setIsFetching(true);
        try {
            let nextSaleId = 1000;
            const { data: maxSale } = await supabase
                .from('me_sales')
                .select('sale_id')
                .order('sale_id', { ascending: false })
                .limit(1)
                .single();
            
            if (maxSale && maxSale.sale_id) {
                nextSaleId = Number(maxSale.sale_id) + 1;
            }

            const itemsPayload = itemsToFulfill.map(item => ({
                order_item_id: item.id,
                quantity: item.fulfillment,
                current_pending: item.pending_quantity
            }));

            const res = await createSale(nextSaleId, selectedCustomer, itemsPayload);
            if (!res.success) {
                throw new Error(res.error);
            }

            onSubmit();
            onClose();
        } catch (error: any) {
            console.error("Failed to create shipment:", error);
            alert(error.message || "Failed to create shipment.");
        } finally {
            setIsFetching(false);
        }
    };

    const groupedAndSortedOrders = useMemo(() => {
        let result = pendingItems.filter(item => {
            const s = searchQuery.toLowerCase();
            return item.product_name.toLowerCase().includes(s) || 
                   item.order_id.toString().includes(s);
        });

        const groupsMap = new Map<number, {
            order_id: number;
            date: string;
            place: string;
            total_pending: number;
            items: PendingOrderItem[];
        }>();

        result.forEach(item => {
            if (!groupsMap.has(item.order_id)) {
                groupsMap.set(item.order_id, {
                    order_id: item.order_id,
                    date: item.date,
                    place: item.place,
                    total_pending: 0,
                    items: []
                });
            }
            const group = groupsMap.get(item.order_id)!;
            group.total_pending += item.pending_quantity;
            group.items.push(item);
        });

        let groups = Array.from(groupsMap.values());

        groups.sort((a, b) => {
            switch(sortBy) {
                case 'qty-desc': return b.total_pending - a.total_pending;
                case 'qty-asc': return a.total_pending - b.total_pending;
                case 'dist-desc': 
                    return (DISTANCES_TO_EDATHALA[b.place] || 0) - (DISTANCES_TO_EDATHALA[a.place] || 0);
                case 'dist-asc': 
                    return (DISTANCES_TO_EDATHALA[a.place] || 0) - (DISTANCES_TO_EDATHALA[b.place] || 0);
                case 'date-desc': 
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'date-asc':
                default: 
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
            }
        });

        return groups;
    }, [pendingItems, searchQuery, sortBy]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Shipment"
            description="Fulfill pending orders to create a shipment."
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={isFetching || pendingItems.filter(i => i.fulfillment > 0).length === 0}
                    >
                        Create Shipment
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-3 bg-foreground/[0.02] p-4 rounded-2xl border border-border/50">
                    <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider">
                        Customer
                    </label>
                    <Select
                        options={customers.map(c => ({ value: c.id, label: c.name }))}
                        value={selectedCustomer}
                        onChange={setSelectedCustomer}
                        placeholder="Select customer..."
                    />
                </div>

                {selectedCustomer && (
                    <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider block mb-1">
                                    Pending Orders
                                </label>
                                <div className="relative w-full sm:w-64">
                                    <Input
                                        placeholder="Search by ID or Item..."
                                        className="pl-8 h-9 text-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                </div>
                            </div>
                            <div className="w-full sm:w-48">
                                <Select
                                    value={sortBy}
                                    onChange={setSortBy}
                                    options={[
                                        { value: 'date-asc', label: 'First Placed' },
                                        { value: 'date-desc', label: 'Last Placed' },
                                        { value: 'qty-desc', label: 'Most Quantity' },
                                        { value: 'qty-asc', label: 'Least Quantity' },
                                        { value: 'dist-desc', label: 'Furthest Location' },
                                        { value: 'dist-asc', label: 'Nearest Location' }
                                    ]}
                                />
                            </div>
                        </div>

                        {isFetching && pendingItems.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 text-sm">Loading pending orders...</div>
                        ) : pendingItems.length === 0 ? (
                            <div className="py-8 text-center text-gray-500 text-sm bg-foreground/[0.02] rounded-xl border border-border/50">
                                No pending orders found for this customer.
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {groupedAndSortedOrders.length > 0 ? groupedAndSortedOrders.map((group) => (
                                        <motion.div 
                                            key={group.order_id}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-foreground/[0.02] p-4 rounded-xl border border-border/50 flex flex-col gap-4"
                                        >
                                            <div className="flex items-center justify-between pb-3 border-b border-border/50">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                        #{group.order_id}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(group.date).toLocaleDateString()}
                                                    </span>
                                                    {group.place && <span className="text-[9px] text-gray-400 uppercase tracking-wide bg-gray-100 px-1.5 py-0.5 rounded">{group.place}</span>}
                                                </div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                    Order Pending <span className="text-sm font-mono text-orange-600">{group.total_pending}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {group.items.map(item => (
                                                    <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                                                        <div className="col-span-6 flex flex-col">
                                                            <span className="text-sm font-semibold text-gray-900">{item.product_name}</span>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-gray-500 font-medium">{item.variant}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="col-span-3 flex flex-col items-end justify-center h-full">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pending</span>
                                                            <span className="text-sm font-mono font-bold text-orange-600">{item.pending_quantity}</span>
                                                        </div>

                                                        <div className="col-span-3 flex flex-col items-end justify-center h-full">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ship Qty</span>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max={item.pending_quantity}
                                                                value={item.fulfillment || ''}
                                                                onChange={(e) => handleFulfillmentChange(item.id, e.target.value)}
                                                                className="w-full text-right font-mono"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div className="py-8 text-center text-gray-500 text-sm bg-foreground/[0.02] rounded-xl border border-border/50">
                                            No matching orders.
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </Modal>
    );
}
