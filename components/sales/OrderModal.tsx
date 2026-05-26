"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, User, UserPlus, Box, Layers, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/lib/supabase';
import { Customer } from '@/lib/types';
import { Select } from '@/components/ui/Select';
import { createCustomer } from '@/lib/actions/customerActions';
import { createOrder } from '@/lib/actions/ordersActions';
import { getPlaces, createPlace } from '@/lib/actions/placesActions';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

interface OrderItemRow {
    id: string;
    itemTypeId: string;
    quantity: number;
}

export function OrderModal({ isOpen, onClose, onSubmit }: OrderModalProps) {
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [customerInput, setCustomerInput] = useState(''); 
    const [customerDistrict, setCustomerDistrict] = useState('');
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [places, setPlaces] = useState<{id: string, name: string}[]>([]);
    
    const [inventory, setInventory] = useState<any[]>([]);
    const [rows, setRows] = useState<OrderItemRow[]>([{ id: '1', itemTypeId: '', quantity: 0 }]);
    const [orderPlace, setOrderPlace] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [showOverview, setShowOverview] = useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            setIsNewCustomer(false);
            setCustomerInput('');
            setCustomerDistrict('');
            setOrderPlace('');
            setRows([{ id: Math.random().toString(), itemTypeId: '', quantity: 0 }]);
        }
    }, [isOpen]);

    // When existing customer changes, update default place
    useEffect(() => {
        if (!isNewCustomer && customerInput) {
            const customer = customers.find(c => c.id === customerInput);
            if (customer && customer.district) {
                setOrderPlace(customer.district);
            }
        } else if (isNewCustomer && customerDistrict) {
            setOrderPlace(customerDistrict);
        }
    }, [customerInput, isNewCustomer, customers, customerDistrict]);

    const fetchData = async () => {
        setIsFetching(true);
        try {
            const { data: custData } = await supabase.from('customers').select('*').eq('is_archived', false).order('name');
            if (custData) setCustomers(custData);

            const placesRes = await getPlaces();
            if (placesRes.success && placesRes.data) {
                setPlaces(placesRes.data);
            }

            const { data: invData } = await supabase
                .from('me_item_types')
                .select(`
                    id,
                    name,
                    quantity,
                    me_items ( id, name, is_archived )
                `)
                .eq('is_archived', false)
                .order('name');
            
            if (invData) {
                const grouped = new Map();
                invData.forEach((row: any) => {
                    if (!row.me_items || row.me_items.is_archived) return;
                    const itemName = row.me_items.name;
                    if (!grouped.has(itemName)) {
                        grouped.set(itemName, { itemName, types: [] });
                    }
                    grouped.get(itemName).types.push({
                        id: row.id,
                        variantName: row.name,
                        available: row.quantity
                    });
                });
                setInventory(Array.from(grouped.values()));
            }
        } catch (error) {
            console.error("Error fetching modal data:", error);
        } finally {
            setIsFetching(false);
        }
    };

    const handleCreateCustomerDistrict = async (name: string) => {
        try {
            const res = await createPlace(name);
            if (res.success && res.data) {
                setPlaces(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
                setCustomerDistrict(res.data.name);
            } else {
                alert("Failed to create place: " + res.error);
            }
        } catch (err) {
            console.error("Error creating place", err);
        }
    };

    const handleCreateOrderPlace = async (name: string) => {
        try {
            const res = await createPlace(name);
            if (res.success && res.data) {
                setPlaces(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
                setOrderPlace(res.data.name);
            } else {
                alert("Failed to create place: " + res.error);
            }
        } catch (err) {
            console.error("Error creating place", err);
        }
    };

    const handleAddRow = () => {
        setRows(prev => [...prev, { id: Math.random().toString(), itemTypeId: '', quantity: 0 }]);
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 100);
    };

    const handleRemoveRow = (id: string) => {
        if (rows.length > 1) {
            setRows(prev => prev.filter(r => r.id !== id));
        }
    };

    const updateRow = (id: string, field: keyof OrderItemRow, value: any) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!customerInput.trim()) {
            alert("Please select or enter a customer.");
            return;
        }

        const validRows = rows.filter(r => r.itemTypeId && r.quantity > 0);
        if (validRows.length === 0) {
            alert("Please add at least one item with a valid quantity.");
            return;
        }

        let finalCustomerId = customerInput;

        if (!orderPlace) {
            alert("Please select a delivery location for this order.");
            return;
        }

        if (isNewCustomer) {
            const res = await createCustomer(customerInput, customerDistrict || undefined);
            if (!res.success) {
                alert(res.error);
                return;
            }
            finalCustomerId = res.data.id;
        }

        let nextOrderId = 1000;
        const { data: maxOrder } = await supabase
            .from('me_orders')
            .select('order_id')
            .order('order_id', { ascending: false })
            .limit(1)
            .single();
        
        if (maxOrder && maxOrder.order_id) {
            nextOrderId = Number(maxOrder.order_id) + 1;
        }

        const insertPayload = validRows.map(row => ({
            order_id: nextOrderId,
            customer_id: finalCustomerId,
            item_type_id: row.itemTypeId,
            quantity: row.quantity,
            pending: row.quantity,
            place: orderPlace,
            done: false
        }));

        const res = await createOrder(insertPayload);
        if (!res.success) {
            alert(res.error);
            return;
        }

        onSubmit({});
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Order"
            description="Record a new order for a customer."
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    {!showOverview ? (
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowOverview(true)} 
                            disabled={isFetching || rows.filter(r => r.itemTypeId && r.quantity > 0).length === 0}
                            className="bg-accent/10 text-accent hover:bg-accent/20"
                        >
                            Review Details
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isFetching}>Confirm Order</Button>
                    )}
                </>
            }
        >
            {isFetching ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
            ) : !showOverview ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Customer Selection */}
                    <div className="space-y-3 bg-foreground/[0.02] p-4 rounded-2xl border border-border/50">
                        <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                            <User size={14} /> Customer Information
                        </label>

                        <div className="relative flex bg-foreground/[0.04] p-1 rounded-xl border border-border/50 mb-2">
                            <button
                                type="button"
                                onClick={() => { setIsNewCustomer(false); setCustomerInput(''); setCustomerDistrict(''); }}
                                className={clsx("relative z-10 flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2",
                                    !isNewCustomer ? "text-white" : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                                )}
                            >
                                <User size={16} /> Existing
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsNewCustomer(true); setCustomerInput(''); setCustomerDistrict(''); }}
                                className={clsx("relative z-10 flex-1 py-1.5 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2",
                                    isNewCustomer ? "text-white" : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                                )}
                            >
                                <UserPlus size={16} /> New Customer
                            </button>
                            <motion.div
                                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-accent rounded-lg shadow-md shadow-accent/20 z-0"
                                initial={false}
                                animate={{ x: isNewCustomer ? '100%' : '0%' }}
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        </div>

                        <AnimatePresence mode="popLayout">
                            <motion.div
                                key={isNewCustomer ? 'new' : 'existing'}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                {isNewCustomer ? (
                                    <div className="space-y-3">
                                        <Input 
                                            placeholder="Enter full customer name" 
                                            value={customerInput} 
                                            onChange={(e) => setCustomerInput(e.target.value)} 
                                            required 
                                            autoFocus
                                        />
                                        <Select
                                            options={[
                                                { value: 'none', label: 'Select Place' },
                                                ...places.map(p => ({ value: p.name, label: p.name }))
                                            ]}
                                            allowCreate
                                            onCreateOption={handleCreateCustomerDistrict}
                                            value={customerDistrict}
                                            onChange={setCustomerDistrict}
                                        />
                                    </div>
                                ) : (
                                    <Select
                                        options={customers.map(c => ({ value: c.id, label: c.name }))}
                                        value={customerInput}
                                        onChange={setCustomerInput}
                                        placeholder="Select a customer..."
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="pt-2">
                            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-2 mb-1">
                                <MapPin size={12} /> Delivery Location
                            </label>
                            <Select
                                options={[
                                    { value: '', label: 'Select Delivery Location...' },
                                    ...places.map(p => ({ value: p.name, label: p.name }))
                                ]}
                                allowCreate
                                onCreateOption={handleCreateOrderPlace}
                                value={orderPlace}
                                onChange={setOrderPlace}
                            />
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                                <Layers size={14} /> Order Items
                            </label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleAddRow}
                                className="text-xs font-bold text-foreground hover:text-foreground hover:bg-foreground/10 px-2 h-8 rounded-lg"
                            >
                                <Plus size={14} className="mr-1" /> Add Item
                            </Button>
                        </div>

                        <div 
                            ref={scrollRef} 
                            className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar relative"
                        >
                            <AnimatePresence mode="popLayout" initial={false}>
                                {rows.map((row, index) => (
                                    <motion.div 
                                        key={row.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
                                        transition={{ duration: 0.2, type: "spring", bounce: 0 }}
                                        className="flex items-end gap-2 bg-foreground/[0.02] p-3 rounded-xl border border-border/50"
                                    >
                                    <div className="flex-[2] min-w-0 space-y-1">
                                        {index === 0 && <label className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">Product</label>}
                                        <Select
                                            options={inventory.flatMap(group => 
                                                group.types.map((type: any) => ({
                                                    value: type.id,
                                                    label: `${group.itemName} - ${type.variantName}`
                                                }))
                                            )}
                                            value={row.itemTypeId}
                                            onChange={(val) => updateRow(row.id, 'itemTypeId', val)}
                                            placeholder="Select Item..."
                                        />
                                    </div>
                                    <div className="w-20 shrink-0 space-y-1">
                                        {index === 0 && <label className="text-[10px] uppercase font-bold text-foreground/50 tracking-wider">Qty</label>}
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            min="1"
                                            value={row.quantity || ''}
                                            onChange={(e) => updateRow(row.id, 'quantity', parseInt(e.target.value) || 0)}
                                            className="text-right font-mono px-2"
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => handleRemoveRow(row.id)}
                                        disabled={rows.length === 1}
                                        className="px-2 text-foreground/40 hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 rounded-lg"
                                        title="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-border/50">
                        <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">Order Summary</h3>
                        <Button variant="ghost" size="sm" onClick={() => setShowOverview(false)} className="h-8 px-2 text-xs">
                            Edit
                        </Button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="bg-foreground/[0.02] p-4 rounded-xl border border-border/50">
                            <p className="text-xs text-foreground/50 uppercase font-bold tracking-wider mb-1">Customer</p>
                            <p className="font-medium">{isNewCustomer ? customerInput : (customers.find(c => c.id === customerInput)?.name || 'Unknown')}</p>
                            <p className="text-xs text-foreground/50 uppercase font-bold tracking-wider mt-3 mb-1">Delivery Location</p>
                            <p className="font-medium flex items-center gap-1"><MapPin size={14} className="text-accent"/> {orderPlace}</p>
                        </div>

                        <div className="bg-foreground/[0.02] p-4 rounded-xl border border-border/50">
                            <p className="text-xs text-foreground/50 uppercase font-bold tracking-wider mb-3">Items ({rows.filter(r => r.itemTypeId && r.quantity > 0).length})</p>
                            <div className="space-y-3 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                                {rows.filter(r => r.itemTypeId && r.quantity > 0).map(row => {
                                    let fullItemName = 'Unknown Item';
                                    inventory.forEach(g => {
                                        const foundType = g.types.find((t: any) => t.id === row.itemTypeId);
                                        if (foundType) {
                                            fullItemName = `${g.itemName} - ${foundType.variantName}`;
                                        }
                                    });
                                    return (
                                        <div key={row.id} className="flex flex-col py-2 border-b border-border/30 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-sm">{fullItemName}</span>
                                                <div className="font-mono text-sm px-2 py-1 bg-accent/10 text-accent rounded-lg">
                                                    {row.quantity}x
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
