"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, User, Layers, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Customer, OrderInvoice } from '@/lib/types';
import { Select } from '@/components/ui/Select';
import { updateFullOrder } from '@/lib/actions/ordersActions';
import { motion, AnimatePresence } from 'framer-motion';

const KERALA_DISTRICTS = [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam',
    'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'
];

interface EditOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    order: OrderInvoice | null;
}

interface OrderItemRow {
    id: string; // "new-..." for new rows, existing uuid for old rows
    isNew: boolean;
    itemTypeId: string;
    quantity: number;
    originalQuantity?: number;
    originalPending?: number;
}

export function EditOrderModal({ isOpen, onClose, onSubmit, order }: EditOrderModalProps) {
    const [customerInput, setCustomerInput] = useState(''); 
    const [customers, setCustomers] = useState<Customer[]>([]);
    
    const [inventory, setInventory] = useState<any[]>([]);
    const [rows, setRows] = useState<OrderItemRow[]>([]);
    const [orderPlace, setOrderPlace] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            if (order) {
                setCustomerInput(order.customer_id);
                setOrderPlace(order.items[0]?.place || '');
                setRows(order.items.map(item => ({
                    id: item.id,
                    isNew: false,
                    itemTypeId: item.item_type_id,
                    quantity: item.quantity,
                    originalQuantity: item.quantity,
                    originalPending: item.pending
                })));
            }
        }
    }, [isOpen, order]);

    const fetchData = async () => {
        setIsFetching(true);
        try {
            const { data: custData } = await supabase.from('customers').select('*').eq('is_archived', false).order('name');
            if (custData) setCustomers(custData);

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

    const handleAddRow = () => {
        setRows(prev => [...prev, { id: `new-${Math.random()}`, isNew: true, itemTypeId: '', quantity: 0 }]);
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 100);
    };

    const handleRemoveRow = (id: string) => {
        const rowToRemove = rows.find(r => r.id === id);
        if (rowToRemove && !rowToRemove.isNew) {
            // Can only remove if completely unfulfilled
            if (rowToRemove.originalQuantity !== rowToRemove.originalPending) {
                alert("Cannot remove an item that has already been partially or fully fulfilled.");
                return;
            }
        }
        
        if (rows.length > 1) {
            setRows(prev => prev.filter(r => r.id !== id));
        } else {
            alert("An order must have at least one item.");
        }
    };

    const updateRow = (id: string, field: keyof OrderItemRow, value: any) => {
        setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!order) return;
        if (!customerInput) {
            alert("Please select a customer.");
            return;
        }

        if (!orderPlace) {
            alert("Please select a delivery location for this order.");
            return;
        }

        const validRows = rows.filter(r => r.itemTypeId && r.quantity > 0);
        if (validRows.length === 0) {
            alert("Please add at least one item with a valid quantity.");
            return;
        }

        // Validate quantities for existing rows
        for (const row of validRows) {
            if (!row.isNew) {
                const fulfilled = row.originalQuantity! - row.originalPending!;
                if (row.quantity < fulfilled) {
                    alert(`Cannot reduce quantity below the amount already fulfilled (${fulfilled}) for item.`);
                    return;
                }
            }
        }

        setIsFetching(true);

        try {
            const itemsToUpdate = [];
            const itemsToAdd = [];
            const itemsToDelete = [];

            // Identify updates and adds
            for (const row of validRows) {
                if (row.isNew) {
                    itemsToAdd.push({
                        item_type_id: row.itemTypeId,
                        quantity: row.quantity,
                        place: orderPlace
                    });
                } else {
                    const fulfilled = row.originalQuantity! - row.originalPending!;
                    const newPending = row.quantity - fulfilled;
                    itemsToUpdate.push({
                        id: row.id,
                        item_type_id: row.itemTypeId,
                        quantity: row.quantity,
                        pending: newPending,
                        place: orderPlace
                    });
                }
            }

            // Identify deletes
            const currentIds = new Set(validRows.filter(r => !r.isNew).map(r => r.id));
            for (const originalItem of order.items) {
                if (!currentIds.has(originalItem.id)) {
                    itemsToDelete.push(originalItem.id);
                }
            }

            const res = await updateFullOrder(order.order_id, customerInput, itemsToUpdate, itemsToAdd, itemsToDelete);
            if (!res.success) {
                alert(res.error);
                return;
            }

            onSubmit();
            onClose();
        } catch (err: any) {
            alert("Failed to update order: " + err.message);
        } finally {
            setIsFetching(false);
        }
    };

    if (!order) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Edit Order #${order.order_id}`}
            description="Modify the customer or items for this order."
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isFetching || rows.length === 0}>Save Changes</Button>
                </>
            }
        >
            {isFetching ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Selection */}
                    <div className="space-y-3 bg-foreground/[0.02] p-4 rounded-2xl border border-border/50">
                        <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                            <User size={14} /> Customer
                        </label>
                        <Select
                            options={customers.map(c => ({ value: c.id, label: c.name }))}
                            value={customerInput}
                            onChange={setCustomerInput}
                            placeholder="Select a customer..."
                        />
                    </div>

                    {/* Delivery Location Section */}
                    <div className="space-y-3 bg-foreground/[0.02] p-4 rounded-2xl border border-border/50">
                        <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                            <MapPin size={14} /> Delivery Location
                        </label>
                        <Select
                            options={[
                                { value: '', label: 'Select Delivery Location...' },
                                ...KERALA_DISTRICTS.map(d => ({ value: d, label: d }))
                            ]}
                            value={orderPlace}
                            onChange={setOrderPlace}
                        />
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
                                            min={row.isNew ? 1 : (row.originalQuantity! - row.originalPending!)}
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
            )}
        </Modal>
    );
}
