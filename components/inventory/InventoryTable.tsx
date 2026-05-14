"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Download, Plus, Package, Tag, Edit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ProductModal } from './ProductModal';
import { GroupEditModal } from './GroupEditModal';
import { Select } from '@/components/ui/Select';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { InventoryItem } from '@/lib/types';
import { deleteItem, deleteItemType } from '@/lib/actions/inventoryActions';
import { Trash2 } from 'lucide-react';

// --- Types ---
// UI-specific interface for the grouping logic, mapping back to the flat DB schema
interface ProductGroup {
    name: string; // Maps to 'item' in DB
    variants: InventoryItem[]; // Array of items with same 'item' name but different 'type'
}

// --- Components ---

interface InventoryCardProps {
    group: ProductGroup;
    onEdit?: (group: ProductGroup) => void;
    onDelete?: () => void;
    canEdit?: boolean;
}

const InventoryCard = ({ group, onEdit, onDelete, canEdit }: InventoryCardProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Calculate total quantity for the group
    const totalQuantity = group.variants.reduce((acc, v) => acc + v.quantity, 0);
    const baseId = group.variants[0]?.item_id;
    const primaryUnit = group.variants[0]?.unit || 'kg';

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
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
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
                            <div className="flex gap-1">
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
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (confirm(`Are you sure you want to delete ${group.name}? This will delete all variants.`)) {
                                            const res = await deleteItem(group.variants[0].item_id as any);
                                            if (res.success) {
                                                onDelete?.();
                                            } else {
                                                alert(res.error);
                                            }
                                        }
                                    }}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-destructive/20 text-gray-400 hover:text-destructive transition-all backdrop-blur-md border border-white/5 hover:border-destructive/30 z-20"
                                    title="Delete Item"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                        <div className="text-right">
                            <span className="text-[10px] text-gray-500 uppercase font-bold block">Total Qty</span>
                            <div className="flex items-baseline justify-end gap-1">
                                <span className={clsx("text-lg font-bold font-mono tracking-tight",
                                    isOutOfStock ? 'text-gray-500' : 'text-white'
                                )}>
                                    {totalQuantity.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-500 truncate max-w-[40px]">{primaryUnit}</span>
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
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider pb-1 border-b border-white/5 text-right">Quantity ({primaryUnit})</div>

                        {group.variants.map((variant) => (
                            <React.Fragment key={variant.id}>
                                <div className="text-gray-400 py-1 flex items-center group/var">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/50 mr-2"></div>
                                    <span className="flex-1">{variant.type || 'Standard'}</span>
                                    {canEdit && (
                                        <button
                                            onClick={async () => {
                                                if (confirm(`Delete variant ${variant.type || 'Standard'}?`)) {
                                                    const res = await deleteItemType(variant.id);
                                                    if (res.success) {
                                                        onDelete?.();
                                                    } else {
                                                        alert(res.error);
                                                    }
                                                }
                                            }}
                                            className="opacity-50 hover:opacity-100 p-1 text-gray-500 hover:text-destructive transition-all"
                                            title="Delete Variant"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
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
    const canEdit = checkRole(['admin']);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState('name_asc');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined);

    // New Group Edit Modal State
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ProductGroup | undefined>(undefined);
    
    const [groups, setGroups] = useState<ProductGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('me_item_types')
                .select(`
                    id,
                    name,
                    quantity,
                    unit,
                    item_id,
                    me_items (
                        id,
                        name
                    )
                `);
                
            if (error) throw error;
            
            if (!data || data.length === 0) {
                setGroups([]);
                return;
            }
            
            // Group by item_name
            const groupedMap = new Map<string, InventoryItem[]>();
            data.forEach((row: any) => {
                // Ensure the join worked and we have an item name
                if (!row.me_items || Array.isArray(row.me_items)) return; 
                
                const itemName = row.me_items.name;
                const invItem: InventoryItem = {
                    id: row.id,
                    item_id: row.item_id,
                    item: itemName,
                    type: row.name, // The variant name in the new schema
                    unit: row.unit, // Pass unit for dynamic display
                    quantity: row.quantity
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
        } catch (error: any) {
            console.error("Error fetching inventory:", error?.message || error, error?.code, error?.details);
            setGroups([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter and Sort logic
    const sortedAndFilteredGroups = useMemo(() => {
        let result = groups;
        
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(g =>
                g.name.toLowerCase().includes(lowerTerm) ||
                g.variants.some(v => (v.type || '').toLowerCase().includes(lowerTerm))
            );
        }

        return [...result].sort((a, b) => {
            const qtyA = a.variants.reduce((acc, v) => acc + v.quantity, 0);
            const qtyB = b.variants.reduce((acc, v) => acc + v.quantity, 0);

            switch (sortOption) {
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                case 'qty_asc':
                    return qtyA - qtyB;
                case 'qty_desc':
                    return qtyB - qtyA;
                default:
                    return 0;
            }
        });
    }, [searchTerm, groups, sortOption]);

    const handleAddProduct = () => {
        setEditingItem(undefined); // Ensure no item is pre-filled for "Add"
        setIsAddModalOpen(true);
    };

    const handleEditGroup = (group: ProductGroup) => {
        setEditingGroup(group);
        setIsGroupModalOpen(true);
    };

    const handleModalSubmit = (data: { item: string; variants: { type: string; quantity: number; unit: string }[] }) => {
        console.log("Saving new item group:", data);
        alert(`Saved ${data.item} with ${data.variants.length} variants - Mock Save`);
        // In real impl: Insert into DB (multiple rows)
    };

    const handleGroupSave = (baseId: number, updates: { id: string; quantity: number; unit: string }[]) => {
        console.log(`Updating Group ${baseId}:`, updates);
        alert(`Updated ${updates.length} variants for Item ID ${baseId} - Mock Save`);
        // In real impl: Iterate and update DB for each
    };

    const handleExport = () => {
        if (sortedAndFilteredGroups.length === 0) {
            alert("No data to export");
            return;
        }

        // Prepare data for CSV
        const exportData = sortedAndFilteredGroups.flatMap(group => 
            group.variants.map(v => ({
                'Item Name': group.name,
                'Variant': v.type || 'Standard',
                'Quantity': v.quantity,
                'Unit': v.unit || 'kg'
            }))
        );

        // Define CSV headers
        const headers = ['Item Name', 'Variant', 'Quantity', 'Unit'];
        
        // Convert to CSV string
        const csvRows = [
            headers.join(','), // Header row
            ...exportData.map(row => 
                headers.map(header => {
                    const val = row[header as keyof typeof row];
                    // Escape commas in values
                    const escaped = typeof val === 'string' && val.includes(',') 
                        ? `"${val}"` 
                        : val;
                    return escaped;
                }).join(',')
            )
        ];

        const csvContent = csvRows.join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        
        link.setAttribute('href', url);
        link.setAttribute('download', `inventory_report_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 p-4 rounded-xl bg-surface backdrop-blur-md border border-border shadow-sm">
                <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto flex-1">
                    <div className="relative w-full md:w-80 group">
                        <Input
                            placeholder="Search items, types..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-black/20 border-white/5 focus:border-primary/50 transition-all font-sans"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                    </div>
                    <div className="w-full md:w-48">
                        <Select
                            value={sortOption}
                            onChange={(val) => setSortOption(val)}
                            options={[
                                { value: 'name_asc', label: 'Alphabetical (A-Z)' },
                                { value: 'name_desc', label: 'Alphabetical (Z-A)' },
                                { value: 'qty_asc', label: 'Quantity (Low - High)' },
                                { value: 'qty_desc', label: 'Quantity (High - Low)' },
                            ]}
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-2 lg:mt-0">
                    <Button variant="secondary" icon={Download} size="sm" onClick={handleExport}>Export Report</Button>
                    {canEdit && <Button variant="primary" icon={Plus} size="sm" className="shadow-lg shadow-primary/20" onClick={handleAddProduct}>Add Item</Button>}
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mr-3"></div>
                    Loading inventory...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedAndFilteredGroups.map(group => (
                        <InventoryCard
                            key={group.name}
                            group={group}
                            canEdit={canEdit}
                            onEdit={handleEditGroup}
                            onDelete={fetchInventory}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && sortedAndFilteredGroups.length === 0 && (
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
                groups={groups}
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
