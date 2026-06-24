"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { InventoryItem } from '@/lib/types';
import { ArrowRightLeft } from 'lucide-react';

interface MigrateVariantModalProps {
    isOpen: boolean;
    onClose: () => void;
    variant: InventoryItem | null;
    currentProductName: string;
    products: { id: string; name: string }[];
    onMigrate: (variantId: string, targetItemId: string) => void | Promise<void>;
}

export function MigrateVariantModal({
    isOpen,
    onClose,
    variant,
    currentProductName,
    products,
    onMigrate
}: MigrateVariantModalProps) {
    const [targetItemId, setTargetItemId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter out the current product from the target list
    const availableProducts = React.useMemo(() => {
        if (!variant) return [];
        return products.filter(p => p.id !== variant.item_id);
    }, [products, variant]);

    // Reset target when modal opens or variant changes
    useEffect(() => {
        if (isOpen && availableProducts.length > 0) {
            setTargetItemId(availableProducts[0].id);
        } else {
            setTargetItemId('');
        }
    }, [isOpen, variant, availableProducts]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!variant || !targetItemId) return;

        setIsSubmitting(true);
        try {
            await onMigrate(variant.id, targetItemId);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!variant) return null;

    const variantName = variant.type || 'Standard';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Migrate Variant"
            description={`Move variant to a different parent product.`}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={!targetItemId || isSubmitting}
                        icon={ArrowRightLeft}
                    >
                        {isSubmitting ? 'Migrating...' : 'Migrate'}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-6 py-2">
                <div className="bg-accent/[0.02] p-4 rounded-xl border border-accent/10 space-y-3">
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Variant to Migrate</span>
                        <span className="text-sm font-semibold text-gray-950 font-mono bg-white px-2.5 py-1 rounded-md border border-gray-100 inline-block mt-1">
                            {variantName}
                        </span>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Current Product</span>
                        <span className="text-sm font-medium text-gray-700 inline-block mt-1">
                            {currentProductName}
                        </span>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Select Destination Product</label>
                    {availableProducts.length > 0 ? (
                        <Select
                            options={availableProducts.map(p => ({ value: p.id, label: p.name }))}
                            value={targetItemId}
                            onChange={setTargetItemId}
                            placeholder="Select target product..."
                        />
                    ) : (
                        <div className="text-sm text-destructive bg-destructive-bg p-3 rounded-lg border border-destructive-bg/30">
                            No other products available. Please create the target product first.
                        </div>
                    )}
                </div>
            </form>
        </Modal>
    );
}
