"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SaleInvoice } from '@/lib/types';

interface SaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (invoice: Omit<SaleInvoice, 'id' | 'items'>) => void;
}

export function SaleModal({ isOpen, onClose, onSubmit }: SaleModalProps) {
    const [customerName, setCustomerName] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            invoice_number: invoiceNumber,
            date,
            customer_name: customerName,
            subtotal: 0,
            tax: 0,
            total: 0,
            status: 'paid'
        });
        onClose();
        setCustomerName(''); setInvoiceNumber('');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create New Sale"
            description="Record a new transaction."
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} icon={undefined}>Record Sale</Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Invoice #</label>
                        <Input placeholder="INV-000" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Date</label>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Customer Name</label>
                    <Input placeholder="Customer or Company Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                </div>


            </form>
        </Modal>
    );
}
