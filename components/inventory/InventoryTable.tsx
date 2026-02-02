"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { TablePagination } from '@/components/ui/TablePagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Edit2, Trash2, Search, Filter, Download, Plus, MapPin, Truck } from 'lucide-react';
import { InventoryItem } from '@/lib/types';
import { Checkbox } from '@/components/ui/Checkbox';
import { useAuth } from '@/context/AuthContext';
import { ProductModal } from './ProductModal';
import clsx from 'clsx';
import styles from '@/components/ui/ui.module.css';

// Mock data for ME Polymers (Updated with Locations and Suppliers)
const INITIAL_DATA: InventoryItem[] = [
    { id: '1', sku: 'POL-HDPE-001', name: 'HDPE Granules - Natural', category: 'Polyethylene', quantity: 2500, unit_price: 85.50, min_stock_level: 500, last_updated: '2024-02-01', location: 'Warehouse A-12', supplier: 'Reliance Industries' },
    { id: '2', sku: 'POL-LDPE-002', name: 'LDPE Film Grade', category: 'Polyethylene', quantity: 180, unit_price: 92.00, min_stock_level: 300, last_updated: '2024-02-01', location: 'Warehouse A-15', supplier: 'Indian Oil Corp' },
    { id: '3', sku: 'POL-PP-003', name: 'Polypropylene Homopolymer', category: 'Polypropylene', quantity: 1800, unit_price: 78.25, min_stock_level: 400, last_updated: '2024-01-30', location: 'Warehouse B-03', supplier: 'GAIL' },
    { id: '4', sku: 'POL-PVC-004', name: 'PVC Resin SG-5', category: 'PVC', quantity: 0, unit_price: 105.00, min_stock_level: 200, last_updated: '2024-01-28', location: 'Warehouse B-08', supplier: 'DCW Ltd' },
    { id: '5', sku: 'POL-PET-005', name: 'PET Chips - Bottle Grade', category: 'Polyester', quantity: 650, unit_price: 112.50, min_stock_level: 300, last_updated: '2024-02-01', location: 'Warehouse C-01', supplier: 'Reliance Industries' },
    { id: '6', sku: 'POL-ABS-006', name: 'ABS Granules - High Impact', category: 'Engineering', quantity: 420, unit_price: 185.00, min_stock_level: 150, last_updated: '2024-01-29', location: 'Warehouse C-05', supplier: 'Bhansali Engineering' },
    { id: '7', sku: 'POL-PC-007', name: 'Polycarbonate Sheets', category: 'Engineering', quantity: 95, unit_price: 245.00, min_stock_level: 50, last_updated: '2024-01-31', location: 'Warehouse D-02', supplier: 'Covestro India' },
    { id: '8', sku: 'POL-PS-008', name: 'Polystyrene GPPS', category: 'Styrenic', quantity: 1200, unit_price: 68.75, min_stock_level: 350, last_updated: '2024-02-01', location: 'Warehouse D-09', supplier: 'Supreme Petrochem' },
];

type SortField = keyof InventoryItem;
type SortDirection = 'asc' | 'desc' | null;

// Hook for items per page
function useResponsiveItemsPerPage() {
    const [itemsPerPage, setItemsPerPage] = useState(25);
    useEffect(() => {
        const update = () => setItemsPerPage(window.innerWidth < 1024 ? 10 : 25);
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    return [itemsPerPage, setItemsPerPage] as const;
}

export default function InventoryTable() {
    const { checkRole } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState(INITIAL_DATA);
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useResponsiveItemsPerPage();
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const canEdit = checkRole(['admin', 'manager']);
    const canDelete = checkRole(['admin']);

    // Determine correct colSpan based on columns shown (added 2 columns: Supplier, Location)
    const columnCount = canDelete ? 10 : 9;

    // Filtering
    const filteredData = useMemo(() => {
        return data.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    // Sorting
    const sortedData = useMemo(() => {
        if (!sortDirection) return filteredData;
        return [...filteredData].sort((a, b) => {
            const aValue = a[sortField] ?? '';
            const bValue = b[sortField] ?? '';
            if (aValue === bValue) return 0;
            const comparison = aValue < bValue ? -1 : 1;
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, itemsPerPage]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getStockStatus = (qty: number, min: number) => {
        if (qty === 0) return { label: 'Out of Stock', className: styles['badge-danger'] };
        if (qty <= min) return { label: 'Low Stock', className: styles['badge-warning'] };
        return { label: 'In Stock', className: styles['badge-success'] };
    };

    const handleDelete = (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            setData(data.filter(item => item.id !== id));
            setSelectedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    const handleSelectItem = (id: string) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
            return newSet;
        });
    };

    const allOnPageSelected = paginatedData.length > 0 && paginatedData.every(item => selectedItems.has(item.id));

    const handleSelectAll = () => {
        if (allOnPageSelected) {
            const newSet = new Set(selectedItems);
            paginatedData.forEach(item => newSet.delete(item.id));
            setSelectedItems(newSet);
        } else {
            const newSet = new Set(selectedItems);
            paginatedData.forEach(item => newSet.add(item.id));
            setSelectedItems(newSet);
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Delete ${selectedItems.size} selected items?`)) {
            setData(data.filter(item => !selectedItems.has(item.id)));
            setSelectedItems(new Set());
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | undefined>(undefined);

    const handleAddProduct = () => {
        setEditingItem(undefined);
        setIsModalOpen(true);
    };

    const handleEditProduct = (item: InventoryItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleModalSubmit = (itemData: Omit<InventoryItem, 'id' | 'last_updated'>) => {
        if (editingItem) {
            // Update existing
            setData(prev => prev.map(item => item.id === editingItem.id ? { ...item, ...itemData, last_updated: new Date().toISOString().split('T')[0] } : item));
        } else {
            // Add new
            const newItem: InventoryItem = {
                id: Math.random().toString(36).substr(2, 9),
                ...itemData,
                last_updated: new Date().toISOString().split('T')[0]
            };
            setData(prev => [newItem, ...prev]);
        }
    };

    const handleExport = () => {
        const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Unit Price', 'Min Stock', 'Location', 'Supplier'];
        const rows = data.map(item => [
            item.sku,
            item.name,
            item.category,
            item.quantity,
            item.unit_price,
            item.min_stock_level,
            item.location || '',
            item.supplier || ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "inventory_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 p-4 rounded-xl bg-surface backdrop-blur-md border border-border shadow-sm">
                <div className="relative w-full lg:w-96 group">
                    <Input
                        placeholder="Search products, SKU, category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-black/20 border-white/5 focus:border-primary/50 transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={18} />
                </div>

                <div className="flex gap-3 overflow-x-auto pb-1 lg:pb-0">
                    {selectedItems.size > 0 && canDelete && (
                        <Button variant="danger" size="sm" onClick={handleBulkDelete} className="animate-pulse">Delete {selectedItems.size}</Button>
                    )}
                    <Button variant="secondary" icon={Download} size="sm" onClick={handleExport}>Export</Button>
                    {canEdit && <Button variant="primary" icon={Plus} size="sm" className="shadow-lg shadow-primary/20" onClick={handleAddProduct}>Add Product</Button>}
                </div>
            </div>

            {/* Table Container - Wrapped for Scrolling */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-surface backdrop-blur-xl shadow-glass">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="sticky top-0 z-10">
                            <TableRow>
                                {canDelete && (
                                    <TableHead className="w-12 text-center">
                                        <Checkbox checked={allOnPageSelected} onChange={handleSelectAll} />
                                    </TableHead>
                                )}
                                <TableHead sortable sortDirection={sortField === 'sku' ? sortDirection : null} onSort={() => handleSort('sku')}>SKU</TableHead>
                                <TableHead sortable sortDirection={sortField === 'name' ? sortDirection : null} onSort={() => handleSort('name')}>Product Name</TableHead>
                                <TableHead sortable sortDirection={sortField === 'category' ? sortDirection : null} onSort={() => handleSort('category')}>Category</TableHead>
                                <TableHead sortable sortDirection={sortField === 'location' ? sortDirection : null} onSort={() => handleSort('location')}>Location</TableHead>
                                <TableHead sortable sortDirection={sortField === 'supplier' ? sortDirection : null} onSort={() => handleSort('supplier')}>Supplier</TableHead>
                                <TableHead sortable sortDirection={sortField === 'quantity' ? sortDirection : null} onSort={() => handleSort('quantity')}>Stock</TableHead>
                                <TableHead sortable sortDirection={sortField === 'unit_price' ? sortDirection : null} onSort={() => handleSort('unit_price')}>Price (₹)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => {
                                    const status = getStockStatus(item.quantity, item.min_stock_level);
                                    const isSelected = selectedItems.has(item.id);
                                    return (
                                        <TableRow key={item.id} selected={isSelected} className={clsx("group", styles['animate-slide-up'])} style={{ animationDelay: `${index * 50}ms` }}>
                                            {canDelete && (
                                                <TableCell className="text-center">
                                                    <Checkbox checked={isSelected} onChange={() => handleSelectItem(item.id)} />
                                                </TableCell>
                                            )}
                                            <TableCell className="font-mono text-xs font-medium text-gray-400 group-hover:text-primary/80 transition-colors">{item.sku}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-foreground group-hover:text-white transition-colors">{item.name}</span>
                                                    {item.quantity <= item.min_stock_level && item.quantity > 0 && <span className="text-[10px] text-warning mt-0.5">Restock needed</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell><span className="inline-flex items-center px-2 py-1 rounded-md bg-white/5 text-xs text-gray-300 border border-white/5">{item.category}</span></TableCell>
                                            <TableCell><div className="flex items-center gap-1.5 text-xs text-gray-400"><MapPin size={12} /> {item.location || '-'}</div></TableCell>
                                            <TableCell><div className="flex items-center gap-1.5 text-xs text-gray-400"><Truck size={12} /> {item.supplier || '-'}</div></TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                                                        <div className={clsx("h-full rounded-full transition-all duration-500", item.quantity === 0 ? 'bg-destructive' : item.quantity <= item.min_stock_level ? 'bg-warning' : 'bg-success')} style={{ width: `${Math.min(100, (item.quantity / 2500) * 100)}%` }} />
                                                    </div>
                                                    <span className={clsx('font-semibold text-sm', item.quantity === 0 ? 'text-destructive' : item.quantity <= item.min_stock_level ? 'text-warning' : 'text-gray-300')}>{item.quantity.toLocaleString()} kg</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-300">₹{item.unit_price.toFixed(2)}</TableCell>
                                            <TableCell><span className={clsx(styles.badge, status.className, 'shadow-sm')}>{status.label}</span></TableCell>
                                            <TableCell className="text-right">
                                                <div className={clsx('flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0')}>
                                                    {canEdit && <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/20 hover:text-primary" title="Edit" onClick={() => handleEditProduct(item)}><Edit2 size={15} /></Button>}
                                                    {canDelete && <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-destructive hover:bg-destructive/10" title="Delete" onClick={() => handleDelete(item.id, item.name)}><Trash2 size={15} /></Button>}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columnCount}>
                                        <EmptyState variant={searchTerm ? "no-results" : "no-data"} title={searchTerm ? "No products match your search" : "No products found"} description={searchTerm ? `We couldn't find any products matching "${searchTerm}"` : "Get started by adding your first product to the inventory."} action={!searchTerm && canEdit ? { label: "Add Product", onClick: handleAddProduct } : undefined} />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {sortedData.length > 0 && (
                <div className="rounded-xl border border-border shadow-sm mt-4">
                    <TablePagination currentPage={currentPage} totalPages={totalPages} totalItems={sortedData.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} />
                </div>
            )}

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingItem}
            />
        </div>
    );
}
