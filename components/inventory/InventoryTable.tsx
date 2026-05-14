"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Download, Plus, Package, Tag, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ProductModal } from './ProductModal';
import { GroupEditModal } from './GroupEditModal';
import { Select } from '@/components/ui/Select';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { InventoryItem } from '@/lib/types';
import { deleteItem, deleteItemType, saveInventory, updateInventoryQuantities } from '@/lib/actions/inventoryActions';

// --- Types ---
interface ProductGroup {
    name: string;
    variants: InventoryItem[];
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

    const totalQuantity = group.variants.reduce((acc, v) => acc + v.quantity, 0);
    const primaryUnit = group.variants[0]?.unit || 'kg';

    const isLowStock = totalQuantity > 0 && totalQuantity < 1000;
    const isOutOfStock = totalQuantity === 0;

    const statusBg = isOutOfStock ? 'bg-destructive-bg text-destructive' : isLowStock ? 'bg-warning-bg text-warning' : 'bg-success-bg text-success';
    const statusDot = isOutOfStock ? 'bg-destructive-bg0' : isLowStock ? 'bg-warning-bg0' : 'bg-success-bg0';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative flex flex-col bg-white border border-gray-100 rounded-3xl overflow-hidden hover:border-gray-300 transition-all duration-300 shadow-sm"
        >
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="p-6 cursor-pointer relative bg-white transition-colors"
            >
                <div className="flex justify-between items-start mb-4">
                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold ${statusBg}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </div>
                    
                    <div className="flex flex-col items-end flex-shrink-0">
                         {canEdit && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit?.(group);
                                    }}
                                    className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
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
                                    className="p-2 rounded-xl bg-destructive-bg hover:bg-red-100 text-destructive transition-colors"
                                    title="Delete Item"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 truncate mb-1" title={group.name}>
                        {group.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <Tag size={14} className="text-gray-400" /> {group.variants.length} Variant{group.variants.length !== 1 ? 's' : ''}
                    </div>
                </div>

                <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                    <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        Total Quantity
                    </div>
                    <div className="flex items-baseline justify-end gap-1">
                        <span className={`text-2xl font-bold font-mono tracking-tight ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>
                            {totalQuantity.toLocaleString()}
                        </span>
                        <span className="text-sm font-semibold text-gray-500">{primaryUnit}</span>
                    </div>
                </div>
            </div>

            <motion.div
                initial={false}
                animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden bg-gray-50/50 border-t border-gray-100"
            >
                <div className="p-6 pt-4">
                    <div className="grid grid-cols-2 gap-x-4 text-sm">
                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest pb-3 border-b border-gray-200">Variant</div>
                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest pb-3 border-b border-gray-200 text-right">Quantity</div>

                        {group.variants.map((variant) => (
                            <React.Fragment key={variant.id}>
                                <div className="text-gray-900 font-semibold py-3 flex items-center group/var border-b border-gray-100 last:border-0">
                                    <span className="flex-1 truncate">{variant.type || 'Standard'}</span>
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
                                            className="opacity-0 group-hover/var:opacity-100 p-1.5 ml-2 text-gray-400 hover:text-destructive hover:bg-destructive-bg rounded-lg transition-all"
                                            title="Delete Variant"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="text-gray-700 font-mono font-medium text-right py-3 border-b border-gray-100 last:border-0">
                                    {variant.quantity.toLocaleString()} {variant.unit}
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
        setEditingItem(undefined);
        setIsAddModalOpen(true);
    };

    const handleEditGroup = (group: ProductGroup) => {
        setEditingGroup(group);
        setIsGroupModalOpen(true);
    };

    const handleModalSubmit = async (data: { item: string; variants: { type: string; quantity: number; unit: string }[] }) => {
        const res = await saveInventory(data);
        if (res.success) {
            fetchInventory();
        } else {
            alert(res.error);
        }
    };

    const handleGroupSave = async (baseId: string, updates: { id: string; quantity: number; unit: string }[]) => {
        const res = await updateInventoryQuantities(updates);
        if (res.success) {
            fetchInventory();
        } else {
            alert(res.error);
        }
    };

    const handleExport = () => {
        if (sortedAndFilteredGroups.length === 0) {
            alert("No data to export");
            return;
        }

        const exportData = sortedAndFilteredGroups.flatMap(group => 
            group.variants.map(v => ({
                'Item Name': group.name,
                'Variant': v.type || 'Standard',
                'Quantity': v.quantity,
                'Unit': v.unit || 'kg'
            }))
        );

        const headers = ['Item Name', 'Variant', 'Quantity', 'Unit'];
        
        const csvRows = [
            headers.join(','),
            ...exportData.map(row => 
                headers.map(header => {
                    const val = row[header as keyof typeof row];
                    const escaped = typeof val === 'string' && val.includes(',') 
                        ? `"${val}"` 
                        : val;
                    return escaped;
                }).join(',')
            )
        ];

        const csvContent = csvRows.join('\n');
        
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between gap-4 p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto flex-1">
                    <div className="relative w-full md:w-80 group">
                        <Input
                            placeholder="Search items, types..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-gray-50 border-gray-200 rounded-xl focus:ring-gray-900 focus:border-gray-900"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-900 transition-colors" size={18} />
                    </div>
                    <div className="w-full md:w-56">
                        <Select
                            value={sortOption}
                            onChange={(val) => setSortOption(val)}
                            className="h-11 rounded-xl border-gray-200"
                            options={[
                                { value: 'name_asc', label: 'Alphabetical (A-Z)' },
                                { value: 'name_desc', label: 'Alphabetical (Z-A)' },
                                { value: 'qty_asc', label: 'Quantity (Low - High)' },
                                { value: 'qty_desc', label: 'Quantity (High - Low)' },
                            ]}
                        />
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="secondary" className="h-11" icon={Download} onClick={handleExport}>Export</Button>
                    {canEdit && <Button variant="primary" className="h-11" icon={Plus} onClick={handleAddProduct}>Add Item</Button>}
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-24 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mr-3"></div>
                    <span className="font-medium">Loading inventory data...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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

            {!isLoading && sortedAndFilteredGroups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-gray-100 bg-gray-50/50 shadow-sm">
                    <div className="bg-white p-4 rounded-full mb-4 shadow-sm border border-gray-100">
                        <Search size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No items found</h3>
                    <p className="text-gray-500 max-w-md text-sm">
                        We couldn't find any inventory items matching "{searchTerm}". Try adjusting your filters or search terms.
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
