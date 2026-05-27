"use client";

import React, { useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';

interface ColumnDef {
    key: string;
    label: string;
}

interface GenericExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any[];
    columns: ColumnDef[];
    filenamePrefix?: string;
}

export function GenericExportModal({ isOpen, onClose, data, columns, filenamePrefix = "export" }: GenericExportModalProps) {
    const [viewMode, setViewMode] = React.useState<'table' | 'raw'>('table');

    const csvContent = useMemo(() => {
        if (data.length === 0) return '';
        const headers = columns.map(c => c.label);
        
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                columns.map(col => {
                    let val = row[col.key];
                    if (val === null || val === undefined) val = '';
                    const strVal = String(val);
                    const escaped = strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')
                        ? `"${strVal.replace(/"/g, '""')}"` 
                        : strVal;
                    return escaped;
                }).join(',')
            )
        ];
        return csvRows.join('\n');
    }, [data, columns]);

    const handleDownload = () => {
        if (!csvContent) return;
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filenamePrefix}_${timestamp}.csv`);
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
            description="Preview the data before downloading the CSV file."
            maxWidth="max-w-5xl"
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
                                        {columns.map((col, idx) => (
                                            <th key={idx} className="px-4 py-3 font-bold whitespace-nowrap">{col.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                                                No data to export
                                            </td>
                                        </tr>
                                    ) : (
                                        data.map((row, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                {columns.map((col, cIdx) => (
                                                    <td key={cIdx} className="px-4 py-3 text-gray-700 whitespace-nowrap">{row[col.key]}</td>
                                                ))}
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
                    <span>{data.length} row{data.length !== 1 ? 's' : ''} to export</span>
                    <span>Format: CSV</span>
                </div>
            </div>
        </Modal>
    );
}
