import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, Plus, UserCircle2, Trash2 } from 'lucide-react';
import { getCustomers, createCustomer, deleteCustomer, hardDeleteCustomer } from '@/lib/actions/customerActions';
import { Customer } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CustomerModal({ isOpen, onClose }: CustomerModalProps) {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            fetchCustomers();
        }
    }, [isOpen]);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const res = await getCustomers();
            if (res.success && res.data) {
                setCustomers(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCustomer = async () => {
        if (!searchTerm.trim()) return;
        
        setIsAdding(true);
        try {
            const res = await createCustomer(searchTerm);
            if (res.success) {
                // Refresh list
                await fetchCustomers();
                // We don't clear the search term so they can see their newly added customer
            } else {
                alert(res.error || "Failed to add customer");
            }
        } catch (error) {
            console.error("Error adding customer:", error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteCustomer = async (id: string, name: string, isArchived?: boolean) => {
        if (isArchived) {
            if (confirm(`Are you sure you want to PERMANENTLY delete ${name}? This action is irreversible.`)) {
                const res = await hardDeleteCustomer(id);
                if (res.success) {
                    await fetchCustomers();
                } else {
                    alert(res.error);
                }
            }
        } else {
            if (confirm(`Are you sure you want to archive ${name}?`)) {
                const res = await deleteCustomer(id);
                if (res.success) {
                    await fetchCustomers();
                } else {
                    alert(res.error);
                }
            }
        }
    };

    const filteredCustomers = customers.filter(c => {
        const query = searchTerm.toLowerCase().trim();
        if (query === 'archived') {
            return c.is_archived;
        }
        if (query === '') {
            return !c.is_archived;
        }
        return c.name.toLowerCase().includes(query);
    });

    const hasExactMatch = customers.some(c => c.name.toLowerCase() === searchTerm.trim().toLowerCase());

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Active & Archived Customers"
            description="View and manage active customers, or search 'archived' to manage archived records."
            footer={
                <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
                    Close
                </Button>
            }
        >
            <div className="space-y-4">
                <div className="relative group">
                    <Input
                        placeholder="Search customers (type 'archived' for soft-deleted)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 bg-gray-50 border-border/50 focus:bg-background transition-all"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={18} />
                </div>

                <div className="bg-gray-50 rounded-2xl border border-border/50 overflow-hidden flex flex-col">
                    <div className="max-h-[50vh] overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar min-h-[200px]">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-32 text-foreground/50">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent mr-3"></div>
                                <span className="text-sm font-medium">Loading customers...</span>
                            </div>
                        ) : filteredCustomers.length > 0 ? (
                            <AnimatePresence>
                                {filteredCustomers.map(customer => (
                                    <motion.div 
                                        key={customer.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group flex items-center gap-2.5 py-1.5 px-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-border/50"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                                            <UserCircle2 size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0 flex items-center gap-2">
                                            <h4 className="text-sm font-bold text-foreground truncate">{customer.name}</h4>
                                            {customer.is_archived && (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100/80 border border-amber-200 text-amber-800 uppercase tracking-wide shrink-0">
                                                    Archived
                                                </span>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteCustomer(customer.id, customer.name, customer.is_archived)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                                            title={customer.is_archived ? "Delete Customer Permanently" : "Archive Customer"}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-32 text-center px-4">
                                <p className="text-sm text-foreground/50 mb-2">No customers found matching "{searchTerm}"</p>
                                {searchTerm.trim() && !hasExactMatch && (
                                    <Button 
                                        size="sm" 
                                        onClick={handleAddCustomer}
                                        disabled={isAdding}
                                        className="bg-accent/10 text-accent hover:bg-accent/20 h-8"
                                    >
                                        {isAdding ? 'Adding...' : (
                                            <>
                                                <Plus size={14} className="mr-1" />
                                                Add "{searchTerm}"
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        )}
                        
                        {/* If there are results but no exact match, show the add button at the bottom */}
                        {filteredCustomers.length > 0 && searchTerm.trim() && !hasExactMatch && (
                            <div className="mt-2 pt-2 border-t border-border/30 px-2 pb-1">
                                <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={handleAddCustomer}
                                    disabled={isAdding}
                                    className="w-full text-accent hover:bg-accent/10 hover:text-accent text-xs justify-start h-9"
                                >
                                    <Plus size={14} className="mr-2" />
                                    Add "{searchTerm}" as a new customer
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
