"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { ProductModal } from '@/components/inventory/ProductModal';
import { SaleModal } from '@/components/sales/SaleModal';
import { InventoryItem, SaleInvoice } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { saveInventory } from '@/lib/actions/inventoryActions';
import { useRouter } from 'next/navigation';

interface ProductGroup {
    name: string;
    variants: InventoryItem[];
}

export default function DashboardActions() {
    const router = useRouter();
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [groups, setGroups] = useState<ProductGroup[]>([]);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const { data, error } = await supabase
                .from('me_item_types')
                .select(`
                    id,
                    name,
                    quantity,
                    unit,
                    item_id,
                    is_archived,
                    me_items (
                        id,
                        name,
                        is_archived
                    )
                `);
                
            if (error) throw error;
            
            if (!data || data.length === 0) {
                setGroups([]);
                return;
            }
            
            const groupedMap = new Map<string, InventoryItem[]>();
            data.forEach((row: any) => {
                if (!row.me_items || Array.isArray(row.me_items)) return; 
                
                const itemName = row.me_items.name;
                const invItem: InventoryItem = {
                    id: row.id,
                    item_id: row.item_id,
                    item: itemName,
                    type: row.name,
                    unit: row.unit,
                    quantity: row.quantity,
                    is_archived: row.is_archived,
                    item_is_archived: row.me_items.is_archived
                };
                
                if (!groupedMap.has(itemName)) {
                    groupedMap.set(itemName, []);
                }
                groupedMap.get(itemName)!.push(invItem);
            });
            
            const fetchedGroups: ProductGroup[] = Array.from(groupedMap.entries()).map(([name, variants]) => ({
                name,
                variants
            }));
            
            setGroups(fetchedGroups);
        } catch (error) {
            console.error("Error fetching inventory for dashboard actions:", error);
            setGroups([]);
        }
    };

    const handleProductSubmit = async (data: { item: string; variants: { type: string; quantity: number; unit: string }[] }) => {
        const res = await saveInventory(data);
        if (res.success) {
            alert(`Stock successfully updated!`);
            setIsProductModalOpen(false);
            router.refresh();
            fetchInventory(); // Refresh the pre-loaded inventory cache
        } else {
            alert(res.error);
        }
    };

    const handleSaleSubmit = () => {
        alert(`Sale recorded successfully!`);
        router.refresh();
    };

    return (
        <>
            <div className="flex gap-3">
                <Button variant="secondary" size="sm" icon={Plus} onClick={() => setIsProductModalOpen(true)}>Add Product</Button>
                <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsSaleModalOpen(true)}>New Sale</Button>
            </div>

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                onSubmit={handleProductSubmit}
                groups={groups}
            />

            <SaleModal
                isOpen={isSaleModalOpen}
                onClose={() => setIsSaleModalOpen(false)}
                onSubmit={handleSaleSubmit}
            />
        </>
    );
}
