"use client";

import React from 'react';
import InventoryTable from '@/components/inventory/InventoryTable';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function InventoryPage() {
    const { checkRole } = useAuth();
    const canAdd = checkRole(['admin']);

    return (
        <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-gray-500">Track stock levels and manage products.</p>
                </div>
            </div>

            <InventoryTable />
        </div>
    );
}
