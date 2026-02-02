"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { ProductModal } from '@/components/inventory/ProductModal';
import { SaleModal } from '@/components/sales/SaleModal';
import { InventoryItem, SaleInvoice } from '@/lib/types';

export default function DashboardActions() {
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

    const handleProductSubmit = (item: Omit<InventoryItem, 'id' | 'last_updated'>) => {
        console.log("New Product Added from Dashboard:", item);
        // In a real app, this would update a global context or trigger a refetch
        alert(`Product "${item.name}" added successfully!`);
    };

    const handleSaleSubmit = (invoice: Omit<SaleInvoice, 'id' | 'items'>) => {
        console.log("New Sale Recorded from Dashboard:", invoice);
        alert(`Sale #${invoice.invoice_number} recorded successfully!`);
    };

    return (
        <>
            <div className="flex gap-2">
                <Button variant="secondary" size="sm" icon={Plus} onClick={() => setIsProductModalOpen(true)}>Add Product</Button>
                <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsSaleModalOpen(true)}>New Sale</Button>
            </div>

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSubmit={handleProductSubmit}
            />

            <SaleModal
                isOpen={isSaleModalOpen}
                onClose={() => setIsSaleModalOpen(false)}
                onSubmit={handleSaleSubmit}
            />
        </>
    );
}
