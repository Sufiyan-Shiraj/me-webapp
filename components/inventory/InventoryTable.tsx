"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Download, Plus, Package, Tag, Edit, Trash2, ChevronRight, PackageOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ProductModal } from './ProductModal';
import { GroupEditModal } from './GroupEditModal';
import { ExportPreviewModal } from './ExportPreviewModal';
import { Select } from '@/components/ui/Select';
import clsx from 'clsx';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { InventoryItem } from '@/lib/types';
import { deleteItem, deleteItemType, saveInventory, updateInventoryQuantities } from '@/lib/actions/inventoryActions';

// --- Types ---
interface ProductGroup {
    name: string;
    variants: InventoryItem[];
}

const tableVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const rowVariants: Variants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 300, damping: 24 } },
    exit: { opacity: 0, y: -10, filter: 'blur(4px)', transition: { duration: 0.2 } }
};

// --- Components ---
interface InventoryCardProps {
    group: ProductGroup;
    onEdit?: (group: ProductGroup) => void;
    onDelete?: () => void;
    canEdit?: boolean;
}

const InventoryTableRow = ({ group, onEdit, onDelete, canEdit }: InventoryCardProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const totalQuantity = group.variants.reduce((acc, v) => acc + v.quantity, 0);
    const primaryUnit = group.variants[0]?.unit || 'kg';

    const isLowStock = totalQuantity > 0 && totalQuantity < 1000;
    const isOutOfStock = totalQuantity === 0;

    const statusBg = isOutOfStock ? 'bg-destructive-bg text-destructive' : isLowStock ? 'bg-warning-bg text-warning' : 'bg-success-bg text-success';
    const statusDot = isOutOfStock ? 'bg-destructive-bg0' : isLowStock ? 'bg-warning-bg0' : 'bg-success-bg0';

    return (
        <>
            <motion.tr
                variants={rowVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "group cursor-pointer transition-colors",
                    isOpen ? "bg-accent/5 hover:bg-accent/10" : "bg-white hover:bg-gray-50/80"
                )}
            >
                <td className="p-4 pl-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <motion.div
                            animate={{ rotate: isOpen ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-gray-400 flex-shrink-0"
                        >
                            <ChevronRight size={18} />
                        </motion.div>
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{group.name}</span>
                            <span className="text-xs text-gray-500 font-medium">{group.variants.length} Variant{group.variants.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </td>
                <td className="p-4 border-b border-gray-100">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${statusBg}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                    </div>
                </td>
                <td className="p-4 text-right border-b border-gray-100">
                    <div className="flex items-baseline justify-end gap-1">
                        <span className={`text-lg font-bold font-mono tracking-tight ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>
                            {totalQuantity.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-gray-500">{primaryUnit}</span>
                    </div>
                </td>
                <td className="p-4 pr-6 text-right border-b border-gray-100">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {canEdit && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit?.(group);
                                    }}
                                    className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-900 shadow-sm transition-all"
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
                                    className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-destructive-bg hover:border-destructive-bg text-gray-400 hover:text-destructive shadow-sm transition-all"
                                    title="Delete Item"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </>
                        )}
                    </div>
                </td>
            </motion.tr>
            
            <AnimatePresence>
                {isOpen && (
                    <tr>
                        <td colSpan={4} className="p-0 border-b border-gray-100 bg-accent/[0.02]">
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="px-6 md:px-12 py-6">
                                    <div className="max-w-2xl bg-white rounded-2xl p-5 shadow-sm border border-accent/10">
                                        <div className="grid grid-cols-2 gap-x-4 mb-2">
                                            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest pb-3 border-b border-gray-100">Variant</div>
                                            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest pb-3 border-b border-gray-100 text-right">Quantity</div>
                                        </div>

                                        <div className="max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                                            {group.variants.map((variant) => (
                                                <div key={variant.id} className="grid grid-cols-2 gap-x-4 group/var border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                                    <div className="text-gray-900 text-sm font-semibold py-3 flex items-center">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-accent/40 mr-3" />
                                                        <span className="flex-1 truncate">{variant.type || 'Standard'}</span>
                                                        {canEdit && (
                                                            <button
                                                                onClick={async (e) => {
                                                                    e.stopPropagation();
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
                                                    <div className="text-gray-700 font-mono font-medium text-sm text-right py-3">
                                                        {variant.quantity.toLocaleString()} <span className="text-gray-400 text-xs ml-0.5">{variant.unit}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </td>
                    </tr>
                )}
            </AnimatePresence>
        </>
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
    
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    
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

        setIsExportModalOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <motion.div 
                initial={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.4, type: 'spring', bounce: 0 }}
                className="flex flex-col lg:flex-row justify-between gap-4 p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-100 shadow-sm"
            >
                <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto flex-1">
                    <div className="relative w-full md:w-80 group">
                        <Input
                            placeholder="Search items, types..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 bg-gray-50/50 border-gray-200/50 rounded-xl focus:bg-white focus:ring-accent focus:border-accent transition-all"
                        />
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={18} />
                    </div>
                    <div className="w-full md:w-56">
                        <Select
                            value={sortOption}
                            onChange={(val) => setSortOption(val)}
                            className="h-11 rounded-xl border-gray-200/50 bg-gray-50/50 focus:bg-white transition-all"
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
                    {canEdit && <Button variant="primary" className="h-11 shadow-md shadow-accent/20" icon={Plus} onClick={handleAddProduct}>Add Item</Button>}
                </div>
            </motion.div>

            {isLoading ? (
                <div className="flex justify-center items-center py-24 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent mr-3"></div>
                    <span className="font-medium">Loading inventory data...</span>
                </div>
            ) : (
                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-3xl font-bold">Product</th>
                                    <th className="px-4 py-4 font-bold">Status</th>
                                    <th className="px-4 py-4 text-right font-bold">Total Quantity</th>
                                    <th className="px-6 py-4 text-right rounded-tr-3xl font-bold">Actions</th>
                                </tr>
                            </thead>
                            <motion.tbody 
                                variants={tableVariants}
                                initial="hidden"
                                animate="show"
                                className="divide-y divide-gray-100"
                            >
                                <AnimatePresence initial={false}>
                                    {sortedAndFilteredGroups.map(group => (
                                        <InventoryTableRow
                                            key={group.name}
                                            group={group}
                                            canEdit={canEdit}
                                            onEdit={handleEditGroup}
                                            onDelete={fetchInventory}
                                        />
                                    ))}
                                </AnimatePresence>
                            </motion.tbody>
                        </table>
                    </div>
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

            <ExportPreviewModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                data={sortedAndFilteredGroups}
            />
        </div>
    );
}
