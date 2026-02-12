"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Download, Plus, Package, Tag, Edit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ProductModal } from './ProductModal';
import { GroupEditModal } from './GroupEditModal';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { InventoryItem } from '@/lib/types';

// --- Types ---
// UI-specific interface for the grouping logic, mapping back to the flat DB schema
interface ProductGroup {
    name: string; // Maps to 'item' in DB
    variants: InventoryItem[]; // Array of items with same 'item' name but different 'type'
}

// --- Mock Data Generator ---
const generateVariants = (itemName: string, baseId: number, types: string[]): InventoryItem[] => {
    return types.map((type, i) => ({
        id: `uuid-${baseId}-${i}`,
        item_id: baseId,
        item: itemName,
        type: type,
        quantity: Math.floor(Math.random() * 5000),
    }));
};

const MOCK_GROUPS: ProductGroup[] = [
    {
        name: 'HDPE Granules',
        variants: generateVariants('HDPE Granules', 101, ['Natural', 'Milky', 'Black', 'Blue', 'Red', 'Green'])
    },
    {
        name: 'LDPE Film Grade',
        variants: generateVariants('LDPE Film Grade', 102, ['Clear', 'Heavy Duty', 'Shrink', 'Lamination'])
    },
    {
        name: 'LLDPE Rotomolding',
        variants: generateVariants('LLDPE Rotomolding', 103, ['Basic', 'High Flow', 'UV Stabilized', 'Color Compounded'])
    },
    {
        name: 'PP Homopolymer',
        variants: generateVariants('PP Homopolymer', 104, ['Injection', 'Raffia', 'Film', 'Fiber', 'Thermoforming'])
    },
    {
        name: 'PP Copolymer',
        variants: generateVariants('PP Copolymer', 105, ['Impact', 'Random', 'High Impact', 'Clarified'])
    },
    {
        name: 'PVC Resin',
        variants: generateVariants('PVC Resin', 106, ['K-57', 'K-67', 'K-70', 'Suspension', 'Emulsion'])
    },
    {
        name: 'PET Chips',
        variants: generateVariants('PET Chips', 107, ['Bottle Grade', 'Textile Grade', 'Film Grade', 'Recycled'])
    },
    {
        name: 'ABS Granules',
        variants: generateVariants('ABS Granules', 108, ['High Impact', 'Heat Resistant', 'Flame Retardant', 'Transparent'])
    },
    {
        name: 'Polycarbonate',
        variants: generateVariants('Polycarbonate', 109, ['General Purpose', 'UV Stabilized', 'Optical Grade', 'Flame Retardant'])
    },
    {
        name: 'Nylon 6',
        variants: generateVariants('Nylon 6', 110, ['Unfilled', 'Glass Filled 15%', 'Glass Filled 30%', 'Impact Modified'])
    },
    {
        name: 'Nylon 66',
        variants: generateVariants('Nylon 66', 111, ['General Purpose', 'Heat Stabilized', 'Toughened', 'Glass Filled'])
    },
    {
        name: 'Polystyrene',
        variants: generateVariants('Polystyrene', 112, ['GPPS', 'HIPS', 'EPS', 'XPS'])
    },
    {
        name: 'Masterbatch',
        variants: generateVariants('Masterbatch', 113, ['White', 'Black', 'Filler', 'Color', 'UV', 'Antistatic'])
    }
];

// Flatten for "Add/Edit" logic if needed, though for now we mostly read Groups
const FLATTENED_INVENTORY: InventoryItem[] = MOCK_GROUPS.flatMap(g => g.variants);

// --- Components ---

interface InventoryCardProps {
    group: ProductGroup;
    onEdit?: (group: ProductGroup) => void;
    canEdit?: boolean;
}

const InventoryCard = ({ group, onEdit, canEdit }: InventoryCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Calculate total quantity for the group
    const totalQuantity = group.variants.reduce((acc, v) => acc + v.quantity, 0);
    const baseId = group.variants[0]?.item_id;

    // Determine overall status based on total quantity
    const isLowStock = totalQuantity < 1000; // Example threshold
    const isOutOfStock = totalQuantity === 0;

    const status = isOutOfStock ? 'bg-destructive/20 text-destructive border-destructive/20'
        : isLowStock ? 'bg-warning/20 text-warning border-warning/20'
            : 'bg-success/20 text-success border-success/20';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative flex flex-col bg-surface backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-300 shadow-glass"
        >
            {/* Header - Click to Toggle */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-4 cursor-pointer relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-25 transition-colors hover:from-gray-100 hover:to-gray-50"
            >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Package size={80} />
                </div>

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-gray-400 uppercase tracking-wider border border-white/5">
                                ID: {baseId}
                            </span>
                            <span className={clsx("px-2 py-0.5 rounded text-[10px] font-bold border truncate", status)}>
                                {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors truncate mb-1" title={group.name}>
                            {group.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Tag size={13} /> {group.variants.length} Types
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        {canEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.(group);
                                }}
                                className="p-1.5 rounded-lg bg-white/5 hover:bg-primary/20 text-gray-400 hover:text-primary transition-all backdrop-blur-md border border-white/5 hover:border-primary/30 z-20"
                                title="Edit Stock"
                            >
                                <Edit size={16} />
                            </button>
                        )}
                        <div className="text-right">
                            <span className="text-[10px] text-gray-500 uppercase font-bold block">Total Qty</span>
                            <div className="flex items-baseline justify-end gap-1">
                                <span className={clsx("text-lg font-bold font-mono tracking-tight",
                                    isOutOfStock ? 'text-gray-500' : 'text-white'
                                )}>
                                    {totalQuantity.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500">kg</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chevron/Indicator */}
                <div className="flex justify-center mt-2 opacity-50">
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" className="text-gray-500">
                            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.div>
                </div>
            </div>

            {/* Expanded Body */}
            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden bg-black/40"
            >
                <div className="p-4 space-y-2 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider pb-1 border-b border-white/5">Type / Variant</div>
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider pb-1 border-b border-white/5 text-right">Quantity (kg)</div>

                        {group.variants.map((variant) => (
                            <React.Fragment key={variant.id}>
                                <div className="text-gray-400 py-1 flex items-center">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mr-2"></div>
                                    {variant.type || 'Standard'}
                                </div>
                                <div className="text-white font-mono text-right py-1">
                                    {variant.quantity.toLocaleString()}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};


export default function InventoryTable() {
    const { checkRole } = useAuth();
    const canEdit = checkRole(['admin', 'manager']);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined);

    // New Group Edit Modal State
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ProductGroup | undefined>(undefined);

    // Filter logic
    const filteredGroups = useMemo(() => {
        if (!searchTerm) return MOCK_GROUPS;
        const lowerTerm = searchTerm.toLowerCase();

        // Filter groups where name matches matches OR any variant type matches
        return MOCK_GROUPS.filter(g =>
            g.name.toLowerCase().includes(lowerTerm) ||
            g.variants.some(v => (v.type || '').toLowerCase().includes(lowerTerm))
        );
    }, [searchTerm]);

    const handleAddProduct = () => {
        setEditingItem(undefined); // Ensure no item is pre-filled for "Add"
        setIsAddModalOpen(true);
    };

    const handleEditGroup = (group: ProductGroup) => {
        setEditingGroup(group);
        setIsGroupModalOpen(true);
    };

    const handleModalSubmit = (data: { item: string; variants: { type: string; quantity: number }[] }) => {
        console.log("Saving new item group:", data);
        alert(`Saved ${data.item} with ${data.variants.length} variants - Mock Save`);
        // In real impl: Insert into DB (multiple rows)
    };

    const handleGroupSave = (baseId: number, updates: { id: string; quantity: number }[]) => {
        console.log(`Updating Group ${baseId}:`, updates);
        alert(`Updated ${updates.length} variants for Item ID ${baseId} - Mock Save`);
        // In real impl: Iterate and update DB for each
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 p-4 rounded-xl bg-surface backdrop-blur-md border border-border shadow-sm">
                <div className="relative w-full lg:w-96 group">
                    <Input
                        placeholder="Search items, types..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-black/20 border-white/5 focus:border-primary/50 transition-all font-sans"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" icon={Download} size="sm">Export Report</Button>
                    {canEdit && <Button variant="primary" icon={Plus} size="sm" className="shadow-lg shadow-primary/20" onClick={handleAddProduct}>Add Item</Button>}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map(group => (
                    <InventoryCard
                        key={group.name}
                        group={group}
                        canEdit={canEdit}
                        onEdit={handleEditGroup}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredGroups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-white/5 bg-surface/50">
                    <div className="bg-white/5 p-4 rounded-full mb-4">
                        <Search size={32} className="text-gray-500" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">No items found</h3>
                    <p className="text-gray-500 max-w-md">
                        We couldn't find any inventory items matching "{searchTerm}". Try checking for typos.
                    </p>
                </div>
            )}

            <ProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingItem}
                groups={MOCK_GROUPS}
            />

            <GroupEditModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                onSubmit={handleGroupSave}
                group={editingGroup}
            />
        </div>
    );
}
