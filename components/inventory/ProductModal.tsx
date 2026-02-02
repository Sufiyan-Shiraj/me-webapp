"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { InventoryItem } from '@/lib/types';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (item: Omit<InventoryItem, 'id' | 'last_updated'>) => void;
    initialData?: InventoryItem;
}

export function ProductModal({ isOpen, onClose, onSubmit, initialData }: ProductModalProps) {
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [minStock, setMinStock] = useState('');
    const [location, setLocation] = useState('');
    const [supplier, setSupplier] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setSku(initialData.sku);
            setCategory(initialData.category);
            setQuantity(initialData.quantity.toString());
            setPrice(initialData.unit_price.toString());
            setMinStock(initialData.min_stock_level.toString());
            setLocation(initialData.location || '');
            setSupplier(initialData.supplier || '');
        } else {
            setName(''); setSku(''); setCategory(''); setQuantity(''); setPrice(''); setMinStock(''); setLocation(''); setSupplier('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            sku,
            name,
            category,
            quantity: Number(quantity),
            unit_price: Number(price),
            min_stock_level: Number(minStock),
            location,
            supplier
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'Edit Product' : 'Add New Product'}
            description="Enter the product details below."
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>{initialData ? 'Save Changes' : 'Add Product'}</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">SKU</label>
                        <Input placeholder="e.g. POL-001" value={sku} onChange={(e) => setSku(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Category</label>
                        <Select
                            options={[
                                { value: 'Polyethylene', label: 'Polyethylene' },
                                { value: 'Polypropylene', label: 'Polypropylene' },
                                { value: 'PVC', label: 'PVC' },
                                { value: 'Engineering', label: 'Engineering' }
                            ]}
                            value={category}
                            onChange={setCategory}
                            placeholder="Select Category"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Product Name</label>
                    <Input placeholder="e.g. HDPE Granules" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Quantity (kg)</label>
                        <Input type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Unit Price (₹)</label>
                        <Input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Min Stock Level</label>
                        <Input type="number" placeholder="100" value={minStock} onChange={(e) => setMinStock(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Location</label>
                        <Input placeholder="Warehouse A-01" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>
                </div>
            </form>
        </Modal>
    );
}
