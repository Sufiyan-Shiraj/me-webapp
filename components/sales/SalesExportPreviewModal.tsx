"use client";

import React, { useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import { SaleInvoice } from '@/lib/types';

interface SalesExportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: SaleInvoice[];
}

export function SalesExportPreviewModal({ isOpen, onClose, data }: SalesExportPreviewModalProps) {
    const [viewMode, setViewMode] = React.useState<'table' | 'raw'>('table');

    const exportData = useMemo(() => {
        return data.flatMap(sale => 
            sale.items.map(item => {
                const itemStatus = item.done || item.pending === 0 ? 'Completed' : (item.pending < item.quantity ? 'Pending' : 'Waiting');
                return {
                    'Sale ID': `#${sale.sale_id}`,
                    'Date': new Date(sale.date).toLocaleDateString(),
                    'Customer': sale.customer_name,
                    'Product': item.product_name,
                    'Variant': item.variant,
                    'Quantity': item.quantity,
                    'Pending': item.pending,
                    'Status': itemStatus
                };
            })
        );
    }, [data]);

    const csvContent = useMemo(() => {
        if (exportData.length === 0) return '';
        const headers = ['Sale ID', 'Date', 'Customer', 'Product', 'Variant', 'Quantity', 'Pending', 'Status'];
        
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
        return csvRows.join('\n');
    }, [exportData]);

    const handleDownload = () => {
        if (!csvContent) return;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        
        link.setAttribute('href', url);
        link.setAttribute('download', `sales_report_${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Export Preview"
            description="Preview the sales data before downloading the CSV file."
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleDownload} icon={Download}>Download CSV</Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="flex justify-end gap-2 mb-2">
                    <button 
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${viewMode === 'table' ? 'bg-accent/10 text-accent' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Table View
                    </button>
                    <button 
                        onClick={() => setViewMode('raw')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${viewMode === 'raw' ? 'bg-accent/10 text-accent' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Raw CSV
                    </button>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto max-h-[50vh] custom-scrollbar">
                        {viewMode === 'table' ? (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-widest sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 font-bold whitespace-nowrap">Sale ID</th>
                                        <th className="px-4 py-3 font-bold whitespace-nowrap">Date</th>
                                        <th className="px-4 py-3 font-bold whitespace-nowrap">Customer</th>
                                        <th className="px-4 py-3 font-bold whitespace-nowrap">Product</th>
                                        <th className="px-4 py-3 font-bold whitespace-nowrap">Variant</th>
                                        <th className="px-4 py-3 text-right font-bold whitespace-nowrap">Qty</th>
                                        <th className="px-4 py-3 text-right font-bold whitespace-nowrap">Pending</th>
                                        <th className="px-4 py-3 font-bold whitespace-nowrap">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {exportData.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                                No data to export
                                            </td>
                                        </tr>
                                    ) : (
                                        exportData.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900">{row['Sale ID']}</td>
                                                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{row['Date']}</td>
                                                <td className="px-4 py-3 font-medium text-gray-900">{row['Customer']}</td>
                                                <td className="px-4 py-3 text-gray-700">{row['Product']}</td>
                                                <td className="px-4 py-3 text-gray-500">{row['Variant']}</td>
                                                <td className="px-4 py-3 text-right font-mono font-medium">{row['Quantity']}</td>
                                                <td className="px-4 py-3 text-right font-mono text-gray-500">{row['Pending']}</td>
                                                <td className="px-4 py-3 text-gray-500">{row['Status']}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <pre className="p-4 text-xs font-mono text-gray-800 whitespace-pre-wrap">
                                {csvContent || "No data to export"}
                            </pre>
                        )}
                    </div>
                </div>
                
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium px-2">
                    <span>{exportData.length} row{exportData.length !== 1 ? 's' : ''} to export</span>
                    <span>Format: CSV</span>
                </div>
            </div>
        </Modal>
    );
}
