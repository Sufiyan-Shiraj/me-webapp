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
import { createCustomer } from '@/lib/actions/customerActions';
import { createSale } from '@/lib/actions/salesActions';

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
    const [customerInput, setCustomerInput] = useState(''); 
    const [customers, setCustomers] = useState<Customer[]>([]);
    
    const [inventory, setInventory] = useState<any[]>([]);
    const [rows, setRows] = useState<SaleItemRow[]>([{ id: '1', itemTypeId: '', quantity: 0 }]);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            setIsNewCustomer(false);
            setCustomerInput('');
            setRows([{ id: Math.random().toString(), itemTypeId: '', quantity: 0 }]);
        }
    }, [isOpen]);

    const fetchData = async () => {
        setIsFetching(true);
        try {
            const { data: custData } = await supabase.from('customers').select('*').order('name');
            if (custData) setCustomers(custData);

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

        if (isNewCustomer) {
            const res = await createCustomer(customerInput);
            if (!res.success) {
                alert(res.error);
                return;
            }
            finalCustomerId = res.data.id;
        }

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

        const insertPayload = validRows.map(row => ({
            sale_id: nextSaleId,
            customer_id: finalCustomerId,
            item_type_id: row.itemTypeId,
            quantity: row.quantity,
            pending: row.quantity,
            done: false
        }));

        const res = await createSale(insertPayload);
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
                <div className="flex justify-center py-10">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Customer Selection */}
                    <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <User size={16} /> Customer Information
                        </label>

                        <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-100 mb-2">
                            <button
                                type="button"
                                onClick={() => { setIsNewCustomer(false); setCustomerInput(''); }}
                                className={clsx("flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                                    !isNewCustomer ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                <User size={16} /> Existing
                            </button>
                            <button
                                type="button"
                                onClick={() => { setIsNewCustomer(true); setCustomerInput(''); }}
                                className={clsx("flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2",
                                    isNewCustomer ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                                )}
                            >
                                <UserPlus size={16} /> New Customer
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
                        <div className="flex items-center justify-between px-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Layers size={16} /> Sale Items
                            </label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleAddRow}
                                className="text-xs font-bold text-gray-900 hover:text-black hover:bg-gray-100 px-2 h-8"
                            >
                                <Plus size={14} className="mr-1" /> Add Item
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {rows.map((row, index) => (
                                <div key={row.id} className="flex items-end gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
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
                                            className="text-right font-mono"
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => handleRemoveRow(row.id)}
                                        disabled={rows.length === 1}
                                        className="px-2 text-gray-400 hover:text-destructive hover:bg-destructive-bg disabled:opacity-30"
                                        title="Remove item"
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>
            )}
        </Modal>
    );
}
