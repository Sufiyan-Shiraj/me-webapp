"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { InventoryItem } from '@/lib/types';
import { Plus, Trash2, Box, Layers, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { Select } from '@/components/ui/Select';

interface ProductGroup {
    name: string;
    variants: InventoryItem[];
}

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (item: { item: string; variants: { type: string; quantity: number; unit: string }[] }) => void;
    initialData?: InventoryItem; // Kept for potential compatibility, though this new flow is optimized for Add
    groups?: ProductGroup[];
}

type ItemMode = 'new' | 'existing';
type TypeMode = 'new' | 'existing';

interface VariantRow {
    id: string;
    typeMode: TypeMode;
    selectedType: string;
    newType: string;
    quantity: string;
    unit: string;
}

export function ProductModal({ isOpen, onClose, onSubmit, groups = [] }: ProductModalProps) {
    const [itemMode, setItemMode] = useState<ItemMode>('new');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [newItemName, setNewItemName] = useState('');

    // Rows for variants
    const [variantRows, setVariantRows] = useState<VariantRow[]>([
        { id: '1', typeMode: 'new', selectedType: '', newType: '', quantity: '', unit: 'kg' }
    ]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setItemMode('new');
            setSelectedGroup('');
            setNewItemName('');
            setVariantRows([{ id: '1', typeMode: 'new', selectedType: '', newType: '', quantity: '', unit: 'kg' }]);
        }
    }, [isOpen]);

    // Handle Item Mode Change
    const handleItemModeChange = (mode: ItemMode) => {
        setItemMode(mode);
        // If switching to new, reset selected group
        // If switching to existing, ensure rows are compatible (e.g. might default to existing type mode)
        setVariantRows(prev => prev.map(row => ({
            ...row,
            typeMode: mode === 'new' ? 'new' : 'existing' // Force new type if item is new
        })));
    };

    // Add a new variant row
    const addVariantRow = () => {
        setVariantRows(prev => [
            ...prev,
            {
                id: Math.random().toString(36).substr(2, 9),
                typeMode: itemMode === 'new' ? 'new' : 'existing',
                selectedType: '',
                newType: '',
                quantity: '',
                unit: 'kg'
            }
        ]);
    };

    // Remove a variant row
    const removeVariantRow = (id: string) => {
        if (variantRows.length > 1) {
            setVariantRows(prev => prev.filter(row => row.id !== id));
        }
    };

    // Update row data
    const updateRow = (id: string, field: keyof VariantRow, value: string) => {
        setVariantRows(prev => prev.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const itemName = itemMode === 'new' ? newItemName : selectedGroup;
        if (!itemName) {
            alert("Please enter or select a product name.");
            return;
        }

        // Validate rows
        const validVariants: { type: string; quantity: number; unit: string }[] = [];
        for (const row of variantRows) {
            const type = row.typeMode === 'new' ? row.newType : row.selectedType;
            const quantity = Number(row.quantity);
            const unit = row.unit || 'kg';

            // Allow empty type (Standard) if user intended, but generally enforce input if "New Type" is selected and typed
            // If type is empty, we can default to 'Standard' or null in backend handling, but let's pass it as is.

            if (quantity > 0) {
                validVariants.push({
                    type: type || 'Standard',
                    quantity,
                    unit
                });
            }
        }

        if (validVariants.length === 0) {
            alert("Please add at least one variant with a quantity.");
            return;
        }

        onSubmit({
            item: itemName,
            variants: validVariants
        });
        onClose();
    };

    const existingGroupData = groups.find(g => g.name === selectedGroup);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Stock"
            description="Add one or more variants for a product."
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Add to Inventory</Button>
                </>
            }
        >
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">

                {/* 1. Item Selection Section */}
                <div className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                        <Box size={14} /> Product Selection
                    </label>

                    <div className="flex bg-gray-100/50 p-1 rounded-xl border border-gray-100 mb-3">
                        <button
                            type="button"
                            onClick={() => handleItemModeChange('new')}
                            className={clsx("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                                itemMode === 'new' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            New Product
                        </button>
                        <button
                            type="button"
                            onClick={() => handleItemModeChange('existing')}
                            className={clsx("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all",
                                itemMode === 'existing' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            Existing Product
                        </button>
                    </div>

                    {itemMode === 'new' ? (
                        <Input
                            placeholder="Enter Product Name (e.g. ABS Granules)"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            autoFocus
                        />
                    ) : (
                        <Select
                            options={groups.map(g => ({ value: g.name, label: g.name }))}
                            value={selectedGroup}
                            onChange={setSelectedGroup}
                            placeholder="Select a product..."
                        />
                    )}
                </div>

                {/* 2. Variants Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Layers size={14} /> Variants & Quantities
                        </label>
                        <button
                            type="button"
                            onClick={addVariantRow}
                            className="text-xs text-gray-900 hover:text-black font-bold flex items-center gap-1"
                        >
                            <Plus size={12} /> Add Row
                        </button>
                    </div>

                    <div className="space-y-2">
                        {variantRows.map((row, index) => (
                            <div key={row.id} className="grid grid-cols-12 gap-2 items-start bg-gray-50/50 p-2 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {/* Type Selection */}
                                <div className="col-span-7 space-y-2">
                                    {itemMode === 'existing' && existingGroupData && (
                                        <div className="flex gap-2 mb-1">
                                            <button
                                                type="button"
                                                onClick={() => updateRow(row.id, 'typeMode', 'existing')}
                                                className={clsx("text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border transition-colors",
                                                    row.typeMode === 'existing' ? "bg-gray-900 text-white border-gray-900" : "bg-transparent text-gray-500 border-transparent hover:bg-gray-200 hover:text-gray-900"
                                                )}
                                            >
                                                Existing
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateRow(row.id, 'typeMode', 'new')}
                                                className={clsx("text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border transition-colors",
                                                    row.typeMode === 'new' ? "bg-gray-900 text-white border-gray-900" : "bg-transparent text-gray-500 border-transparent hover:bg-gray-200 hover:text-gray-900"
                                                )}
                                            >
                                                New Type
                                            </button>
                                        </div>
                                    )}

                                    {row.typeMode === 'existing' && itemMode === 'existing' ? (
                                        <Select
                                            options={existingGroupData?.variants.map(v => ({ value: v.type || '', label: v.type || 'Standard' })) || []}
                                            value={row.selectedType}
                                            onChange={(val) => updateRow(row.id, 'selectedType', val)}
                                            placeholder="Select Type..."
                                            className="h-8"
                                        />
                                    ) : (
                                        <Input
                                            placeholder="Type (e.g. Natural)"
                                            value={row.newType}
                                            onChange={(e) => updateRow(row.id, 'newType', e.target.value)}
                                            className="h-8 text-xs"
                                        />
                                    )}
                                </div>

                                <div className="col-span-3 mt-auto">
                                    {index === 0 && <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Qty</label>}
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={row.quantity}
                                        onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                                        className="h-8 text-right font-mono text-xs"
                                        min="0"
                                    />
                                </div>

                                {/* Unit */}
                                <div className="col-span-2 mt-auto">
                                    {index === 0 && <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Unit</label>}
                                    <Select
                                        options={[
                                            { value: 'kg', label: 'kg' },
                                            { value: 'g', label: 'g' },
                                            { value: 'pcs', label: 'pcs' },
                                            { value: 'Nos', label: 'Nos' },
                                            { value: 'ltr', label: 'ltr' },
                                        ]}
                                        value={row.unit}
                                        onChange={(val) => updateRow(row.id, 'unit', val)}
                                        className="h-8"
                                    />
                                </div>

                                {/* Delete Action */}
                                <div className="col-span-1 flex justify-center mt-auto pb-1.5">
                                    <button
                                        type="button"
                                        onClick={() => removeVariantRow(row.id)}
                                        disabled={variantRows.length === 1}
                                        className="text-gray-400 hover:text-destructive disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
