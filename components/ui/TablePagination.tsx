import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { Select } from './Select';
import clsx from 'clsx';

interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
}

const DotsInput = ({ onJump, totalPages }: { onJump: (p: number) => void, totalPages: number }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [val, setVal] = useState('');

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        let p = parseInt(val, 10);
        if (isNaN(p)) {
            setIsEditing(false);
            return;
        }
        if (p < 1) p = 1;
        if (p > totalPages) p = totalPages;
        onJump(p);
        setIsEditing(false);
        setVal('');
    };

    if (isEditing) {
        return (
            <form onSubmit={handleSubmit} className="inline-flex items-center mx-1">
                <input 
                    type="number" 
                    autoFocus
                    value={val}
                    onChange={e => setVal(e.target.value)}
                    onBlur={() => handleSubmit()}
                    className="w-12 h-8 text-center text-sm font-semibold rounded-lg border border-accent focus:border-accent focus:ring-1 focus:ring-accent outline-none bg-surface text-foreground [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-sm transition-all"
                />
            </form>
        );
    }
    
    return (
        <button 
            onClick={() => setIsEditing(true)} 
            className="px-2 text-foreground/50 hover:text-foreground hover:bg-foreground/5 h-8 rounded-lg transition-colors cursor-pointer font-bold"
            title="Jump to page"
        >
            …
        </button>
    );
};

export function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}: TablePaginationProps) {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-surface rounded-b-3xl border-t border-border">
            <div className="text-sm text-foreground/60 font-medium">
                Showing <span className="font-bold text-foreground">{startItem}</span> to{' '}
                <span className="font-bold text-foreground">{endItem}</span> of{' '}
                <span className="font-bold text-foreground">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-6">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground/60 font-medium">Per page:</span>
                    <div className="w-20">
                        <Select
                            options={[
                                { value: 10, label: '10' },
                                { value: 25, label: '25' },
                                { value: 50, label: '50' },
                                { value: 100, label: '100' },
                            ]}
                            value={itemsPerPage}
                            onChange={(val: number) => {
                                onItemsPerPageChange(Number(val));
                                onPageChange(1);
                            }}
                        />
                    </div>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="hidden sm:flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                            <React.Fragment key={index}>
                                {page === '...' ? (
                                    <DotsInput onJump={onPageChange} totalPages={totalPages} />
                                ) : (
                                    <button
                                        onClick={() => onPageChange(page as number)}
                                        className={clsx(
                                            'h-8 min-w-[32px] px-3 rounded-lg text-sm font-semibold transition-all duration-200 border',
                                            page === currentPage
                                                ? 'bg-foreground text-background border-foreground shadow-sm'
                                                : 'text-foreground/60 border-transparent hover:text-foreground hover:bg-foreground/5'
                                        )}
                                    >
                                        {page}
                                    </button>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/5 disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
