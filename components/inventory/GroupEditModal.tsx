"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { InventoryItem } from '@/lib/types';
import clsx from 'clsx';
import { Select } from '@/components/ui/Select';

interface ProductGroup {
    name: string;
    variants: InventoryItem[];
}

interface GroupEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (item_id: string, updates: { id: string; quantity: number; unit: string }[]) => void | Promise<void>;
    group?: ProductGroup;
}

export function GroupEditModal({ isOpen, onClose, onSubmit, group }: GroupEditModalProps) {
    const [variants, setVariants] = useState<InventoryItem[]>([]);

    useEffect(() => {
        if (group) {
            // Create a deep copy to avoid mutating props directly
            setVariants(group.variants.map(v => ({ ...v })));
        }
    }, [group, isOpen]);

    const handleQuantityChange = (id: string, newQty: string) => {
        setVariants(prev => prev.map(v =>
            v.id === id ? { ...v, quantity: Number(newQty) } : v
        ));
    };

    const handleUnitChange = (id: string, newUnit: string) => {
        setVariants(prev => prev.map(v =>
            v.id === id ? { ...v, unit: newUnit } : v
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!group) return;

        const baseId = group.variants[0]?.item_id;
        const updates = variants.map(v => ({
            id: v.id,
            quantity: v.quantity,
            unit: v.unit || 'kg'
        }));

        onSubmit(baseId, updates);
        onClose();
    };

    if (!group) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Edit Stock: ${group.name}`}
            description="Update quantities for all variants below."
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save All Changes</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                    <div className="col-span-5">Variant Type</div>
                    <div className="col-span-4">Quantity</div>
                    <div className="col-span-3">Unit</div>
                </div>

                {variants.map((variant) => (
                    <div key={variant.id} className="grid grid-cols-12 gap-3 items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="col-span-5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                                <span className="font-medium text-gray-900 truncate" title={variant.type || 'Standard'}>{variant.type || 'Standard'}</span>
                            </div>
                        </div>
                        <div className="col-span-4">
                            <Input
                                type="number"
                                value={variant.quantity.toString()}
                                onChange={(e) => handleQuantityChange(variant.id, e.target.value)}
                                className="text-right font-mono text-sm"
                                min="0"
                            />
                        </div>
                        <div className="col-span-3">
                            <Select
                                options={[
                                    { value: 'kg', label: 'kg' },
                                    { value: 'g', label: 'g' },
                                    { value: 'pcs', label: 'pcs' },
                                    { value: 'Nos', label: 'Nos' },
                                    { value: 'ltr', label: 'ltr' },
                                ]}
                                value={variant.unit || 'kg'}
                                onChange={(val) => handleUnitChange(variant.id, val)}
                            />
                        </div>
                    </div>
                ))}
            </form>
        </Modal>
    );
}
