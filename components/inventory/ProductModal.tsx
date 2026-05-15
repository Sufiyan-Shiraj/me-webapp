import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { InventoryItem } from '@/lib/types';
import { Plus, Trash2, Box, Layers, Package } from 'lucide-react';
import clsx from 'clsx';
import { Select } from '@/components/ui/Select';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGroup {
    name: string;
    variants: InventoryItem[];
}

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (item: { item: string; variants: { type: string; quantity: number; unit: string }[] }) => void;
    initialData?: InventoryItem;
    groups?: ProductGroup[];
}

type ItemMode = 'new' | 'existing';
type TypeMode = 'new' | 'existing';

interface VariantRow {
    id: string;
    typeMode: TypeMode;
    selectedType: string;
    newType: string;
    quantity: string;
    unit: string;
}

export function ProductModal({ isOpen, onClose, onSubmit, groups = [] }: ProductModalProps) {
    const [itemMode, setItemMode] = useState<ItemMode>('new');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [newItemName, setNewItemName] = useState('');

    const [variantRows, setVariantRows] = useState<VariantRow[]>([
        { id: '1', typeMode: 'new', selectedType: '', newType: '', quantity: '', unit: 'kg' }
    ]);
    const [showOverview, setShowOverview] = useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setItemMode('new');
            setSelectedGroup('');
            setNewItemName('');
            setVariantRows([{ id: '1', typeMode: 'new', selectedType: '', newType: '', quantity: '', unit: 'kg' }]);
            setShowOverview(false);
        }
    }, [isOpen]);

    // Handle Item Mode Change
    const handleItemModeChange = (mode: ItemMode) => {
        setItemMode(mode);
        // If switching to new, reset selected group
        // If switching to existing, ensure rows are compatible (e.g. might default to existing type mode)
        setVariantRows(prev => prev.map(row => ({
            ...row,
            typeMode: mode === 'new' ? 'new' : 'existing' // Force new type if item is new
        })));
    };

    const addVariantRow = () => {
        setVariantRows(prev => [
            ...prev,
            {
                id: Math.random().toString(36).substr(2, 9),
                typeMode: itemMode === 'new' ? 'new' : 'existing',
                selectedType: '',
                newType: '',
                quantity: '',
                unit: 'kg'
            }
        ]);
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }
        }, 100);
    };

    // Remove a variant row
    const removeVariantRow = (id: string) => {
        if (variantRows.length > 1) {
            setVariantRows(prev => prev.filter(row => row.id !== id));
        }
    };

    // Update row data
    const updateRow = (id: string, field: keyof VariantRow, value: string) => {
        setVariantRows(prev => prev.map(row =>
            row.id === id ? { ...row, [field]: value } : row
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const itemName = itemMode === 'new' ? newItemName : selectedGroup;
        if (!itemName) {
            alert("Please enter or select a product name.");
            return;
        }

        // Validate rows
        const validVariants: { type: string; quantity: number; unit: string }[] = [];
        for (const row of variantRows) {
            const type = row.typeMode === 'new' ? row.newType : row.selectedType;
            const quantity = Number(row.quantity);
            const unit = row.unit || 'kg';

            // Allow empty type (Standard) if user intended, but generally enforce input if "New Type" is selected and typed
            // If type is empty, we can default to 'Standard' or null in backend handling, but let's pass it as is.

            if (quantity > 0) {
                validVariants.push({
                    type: type || 'Standard',
                    quantity,
                    unit
                });
            }
        }

        if (validVariants.length === 0) {
            alert("Please add at least one variant with a quantity.");
            return;
        }

        onSubmit({
            item: itemName,
            variants: validVariants
        });
        onClose();
    };

    const existingGroupData = groups.find(g => g.name === selectedGroup);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Stock"
            description="Add one or more variants for a product."
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    {!showOverview ? (
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowOverview(true)} 
                            disabled={variantRows.filter(r => Number(r.quantity) > 0 && (r.typeMode === 'new' ? r.newType || true : r.selectedType)).length === 0}
                            className="bg-accent/10 text-accent hover:bg-accent/20"
                        >
                            Review Details
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit}>Confirm & Add</Button>
                    )}
                </>
            }
        >
            {!showOverview ? (
                <div className="space-y-6">

                {/* 1. Item Selection Section */}
                <div className="space-y-3 bg-foreground/[0.02] p-4 rounded-2xl border border-border/50">
                    <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                        <Box size={14} /> Product Selection
                    </label>

                    <div className="relative flex bg-foreground/[0.04] p-1 rounded-xl border border-border/50 mb-3">
                        <button
                            type="button"
                            onClick={() => handleItemModeChange('new')}
                            className={clsx("relative z-10 flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors",
                                itemMode === 'new' ? "text-white" : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                            )}
                        >
                            New Product
                        </button>
                        <button
                            type="button"
                            onClick={() => handleItemModeChange('existing')}
                            className={clsx("relative z-10 flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors",
                                itemMode === 'existing' ? "text-white" : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                            )}
                        >
                            Existing Product
                        </button>
                        <motion.div
                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-accent rounded-lg shadow-md shadow-accent/20 z-0"
                            initial={false}
                            animate={{ x: itemMode === 'existing' ? '100%' : '0%' }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    </div>

                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={itemMode}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            {itemMode === 'new' ? (
                                <Input
                                    placeholder="Enter Product Name (e.g. ABS Granules)"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    autoFocus
                                />
                            ) : (
                                <Select
                                    options={groups.map(g => ({ value: g.name, label: g.name }))}
                                    value={selectedGroup}
                                    onChange={setSelectedGroup}
                                    placeholder="Select a product..."
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* 2. Variants Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-bold text-foreground/50 uppercase tracking-wider flex items-center gap-2">
                            <Layers size={14} /> Variants & Quantities
                        </label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addVariantRow}
                            className="text-xs font-bold text-foreground hover:text-foreground hover:bg-foreground/10 px-2 h-8 rounded-lg"
                        >
                            <Plus size={14} className="mr-1" /> Add Row
                        </Button>
                    </div>

                    <div 
                        ref={scrollRef}
                        className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar relative"
                    >
                        <AnimatePresence mode="popLayout" initial={false}>
                            {variantRows.map((row, index) => (
                                <motion.div 
                                    key={row.id} 
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
                                    transition={{ duration: 0.2, type: "spring", bounce: 0 }}
                                    className="flex items-end gap-2 bg-foreground/[0.02] p-3 rounded-xl border border-border/50"
                                >
                                    {/* Type Selection */}
                                <div className="flex-1 space-y-1">
                                    {itemMode === 'existing' && existingGroupData && (
                                        <div className="relative flex bg-foreground/[0.04] p-0.5 rounded-lg border border-border/50 mb-1 w-fit">
                                            <button
                                                type="button"
                                                onClick={() => updateRow(row.id, 'typeMode', 'existing')}
                                                className={clsx("relative z-10 text-[10px] uppercase font-bold px-3 py-1 rounded-md transition-colors tracking-wider",
                                                    row.typeMode === 'existing' ? "text-white" : "text-foreground/50 hover:text-foreground"
                                                )}
                                            >
                                                Existing
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateRow(row.id, 'typeMode', 'new')}
                                                className={clsx("relative z-10 text-[10px] uppercase font-bold px-3 py-1 rounded-md transition-colors tracking-wider",
                                                    row.typeMode === 'new' ? "text-white" : "text-foreground/50 hover:text-foreground"
                                                )}
                                            >
                                                New Type
                                            </button>
                                            <motion.div
                                                className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] bg-accent rounded-md shadow-sm z-0"
                                                initial={false}
                                                animate={{ x: row.typeMode === 'new' ? '100%' : '0%' }}
                                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            />
                                        </div>
                                    )}

                                    {row.typeMode === 'existing' && itemMode === 'existing' ? (
                                        <Select
                                            options={existingGroupData?.variants.map(v => ({ value: v.type || '', label: v.type || 'Standard' })) || []}
                                            value={row.selectedType}
                                            onChange={(val) => updateRow(row.id, 'selectedType', val)}
                                            placeholder="Select Type..."
                                        />
                                    ) : (
                                        <Input
                                            placeholder="Type (e.g. Natural)"
                                            value={row.newType}
                                            onChange={(e) => updateRow(row.id, 'newType', e.target.value)}
                                        />
                                    )}
                                </div>

                                <div className="w-24 space-y-1">
                                    {index === 0 && <label className="block text-[10px] text-foreground/50 uppercase font-bold tracking-wider">Qty</label>}
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={row.quantity}
                                        onChange={(e) => updateRow(row.id, 'quantity', e.target.value)}
                                        className="text-right font-mono"
                                        min="0"
                                    />
                                </div>

                                {/* Unit */}
                                <div className="w-20 space-y-1">
                                    {index === 0 && <label className="block text-[10px] text-foreground/50 uppercase font-bold tracking-wider">Unit</label>}
                                    <Select
                                        options={[
                                            { value: 'kg', label: 'kg' },
                                            { value: 'g', label: 'g' },
                                            { value: 'pcs', label: 'pcs' },
                                            { value: 'Nos', label: 'Nos' },
                                            { value: 'ltr', label: 'ltr' },
                                        ]}
                                        value={row.unit}
                                        onChange={(val) => updateRow(row.id, 'unit', val)}
                                    />
                                </div>

                                {/* Delete Action */}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => removeVariantRow(row.id)}
                                    disabled={variantRows.length === 1}
                                    className="px-2 text-foreground/40 hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 rounded-lg"
                                    title="Remove item"
                                >
                                    <Trash2 size={18} />
                                </Button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-border/50">
                        <h3 className="text-sm font-semibold tracking-wide text-foreground uppercase">Inventory Summary</h3>
                        <Button variant="ghost" size="sm" onClick={() => setShowOverview(false)} className="h-8 px-2 text-xs">
                            Edit
                        </Button>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="bg-foreground/[0.02] p-4 rounded-xl border border-border/50">
                            <p className="text-xs text-foreground/50 uppercase font-bold tracking-wider mb-1">Product</p>
                            <p className="font-medium">{itemMode === 'new' ? newItemName : selectedGroup}</p>
                        </div>

                        <div className="bg-foreground/[0.02] p-4 rounded-xl border border-border/50">
                            <p className="text-xs text-foreground/50 uppercase font-bold tracking-wider mb-3">Variants ({variantRows.filter(r => Number(r.quantity) > 0).length})</p>
                            <div className="space-y-3 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                                {variantRows.filter(r => Number(r.quantity) > 0).map(row => {
                                    const typeName = row.typeMode === 'new' ? row.newType : row.selectedType;
                                    return (
                                        <div key={row.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 last:pb-0">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{typeName || 'Standard'}</span>
                                            </div>
                                            <div className="font-mono text-sm px-2 py-1 bg-accent/10 text-accent rounded-lg">
                                                +{row.quantity} {row.unit}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
