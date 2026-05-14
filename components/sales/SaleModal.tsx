"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, User, UserPlus, Box, Layers } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/lib/supabase';
import { Customer, ItemType } from '@/lib/types';
import { Select } from '@/components/ui/Select';

interface SaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
}

interface SaleItemRow {
    id: string;
    itemTypeId: string;
    quantity: number;
}

export function SaleModal({ isOpen, onClose, onSubmit }: SaleModalProps) {
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [customerInput, setCustomerInput] = useState(''); // ID if existing, Name if new
    const [customers, setCustomers] = useState<Customer[]>([]);
    
    const [inventory, setInventory] = useState<any[]>([]); // Grouped items and types
    const [rows, setRows] = useState<SaleItemRow[]>([{ id: '1', itemTypeId: '', quantity: 0 }]);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            // Reset state
            setIsNewCustomer(false);
            setCustomerInput('');
            setRows([{ id: Math.random().toString(), itemTypeId: '', quantity: 0 }]);
        }
    }, [isOpen]);

    const fetchData = async () => {
        setIsFetching(true);
        try {
            // Fetch Customers
            const { data: custData } = await supabase.from('customers').select('*').order('name');
            if (custData) setCustomers(custData);

            // Fetch Items and Types
            const { data: invData } = await supabase
                .from('me_item_types')
                .select(`
                    id,
                    name,
                    quantity,
                    me_items ( id, name )
                `)
                .order('name');
            
            if (invData) {
                // Group by Item Name for easier selection
                const grouped = new Map();
                invData.forEach((row: any) => {
                    const itemName = row.me_items?.name || 'Unknown';
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
        setRows(prev => [...prev, { id: Math.random().toString(), itemTypeId: '', quantity: 0 }]);
    };

    const handleRemoveRow = (id: string) => {
        if (rows.length > 1) {
            setRows(prev => prev.filter(r => r.id !== id));
        }
    };

    const updateRow = (id: string, field: keyof SaleItemRow, value: any) => {
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

        // If new customer, insert them first
        if (isNewCustomer) {
            const { data, error } = await supabase
                .from('customers')
                .insert({ name: customerInput.trim() })
                .select()
                .single();
            
            if (error) {
                console.error("Error creating customer:", error);
                alert("Could not create new customer. They might already exist.");
                return;
            }
            finalCustomerId = data.id;
        }

        // Get Next Sale ID
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

        // Insert Sales Rows
        const insertPayload = validRows.map(row => ({
            sale_id: nextSaleId,
            customer_id: finalCustomerId,
            item_type_id: row.itemTypeId,
            quantity: row.quantity,
            pending: row.quantity, // Initially all pending
            done: false
        }));

        const { error: saleError } = await supabase.from('me_sales').insert(insertPayload);
        if (saleError) {
            console.error("Error saving sale:", saleError);
            alert("Failed to save sale.");
            return;
        }

        onSubmit({}); // Tell parent to refresh
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Sale"
            description="Record a new transaction with items."
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isFetching}>Record Sale</Button>
                </>
            }
        >
            {isFetching ? (
                <div className="flex justify-center py-10"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div></div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    
                    {/* Customer Selection */}
                    <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <User size={14} /> Customer Information
                        </label>

                        <div className="flex bg-black/20 p-1 rounded-lg border border-white/5 mb-2">
                            <button
                                type="button"
                                onClick={() => { setIsNewCustomer(false); setCustomerInput(''); }}
                                className={clsx("flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2",
                                    !isNewCustomer ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                                )}
                            >
                                <User size={14} /> Existing
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsNewCustomer(true); setCustomerInput(''); }}
                                className={clsx("flex-1 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2",
                                    isNewCustomer ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                                )}
                            >
                                <UserPlus size={14} /> New Customer
                            </button>
                        </div>

                        {isNewCustomer ? (
                            <Input 
                                placeholder="Enter full customer name" 
                                value={customerInput} 
                                onChange={(e) => setCustomerInput(e.target.value)} 
                                required 
                                autoFocus
                            />
                        ) : (
                            <Select
                                options={customers.map(c => ({ value: c.id, label: c.name }))}
                                value={customerInput}
                                onChange={setCustomerInput}
                                placeholder="Select a customer..."
                            />
                        )}
                    </div>

                    {/* Items Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Layers size={14} /> Sale Items
                            </label>
                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="text-xs text-primary hover:text-primary-300 font-bold flex items-center gap-1"
                            >
                                <Plus size={12} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-2">
                            {rows.map((row, index) => (
                                <div key={row.id} className="flex items-end gap-2 bg-white/5 p-2 rounded-lg border border-white/5">
                                    <div className="flex-1 space-y-1">
                                        {index === 0 && <label className="text-[10px] uppercase font-bold text-gray-500">Product & Variant</label>}
                                        <Select
                                            options={inventory.flatMap(group => 
                                                group.types.map((type: any) => ({
                                                    value: type.id,
                                                    label: `${group.itemName} - ${type.variantName} (${type.available} left)`
                                                }))
                                            )}
                                            value={row.itemTypeId}
                                            onChange={(val) => updateRow(row.id, 'itemTypeId', val)}
                                            placeholder="Select Item..."
                                            className="text-xs"
                                        />
                                    </div>
                                    <div className="w-24 space-y-1">
                                        {index === 0 && <label className="text-[10px] uppercase font-bold text-gray-500">Qty</label>}
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            min="1"
                                            value={row.quantity || ''}
                                            onChange={(e) => updateRow(row.id, 'quantity', parseInt(e.target.value) || 0)}
                                            className="h-[30px] text-right font-mono text-xs"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRow(row.id)}
                                        disabled={rows.length === 1}
                                        className="h-[30px] px-2 text-gray-500 hover:text-destructive disabled:opacity-30 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            )}
        </Modal>
    );
}
