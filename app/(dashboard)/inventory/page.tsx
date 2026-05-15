"use client";

import React from 'react';
import InventoryTable from '@/components/inventory/InventoryTable';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function InventoryPage() {
    const { checkRole } = useAuth();
    const canAdd = checkRole(['admin']);

    return (
        <div className="space-y-6">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track your products and stock levels.</p>
                </div>
            </motion.div>

            <InventoryTable />
        </div>
    );
}
