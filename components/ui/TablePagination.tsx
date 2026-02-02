import React from 'react';
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-transparent border-t border-white/5 backdrop-blur-sm">
            <div className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">{startItem}</span> to{' '}
                <span className="font-medium text-white">{endItem}</span> of{' '}
                <span className="font-medium text-white">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-6">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Per page:</span>
                    <div className="w-20">
                        <Select
                            options={[
                                { value: 10, label: '10' },
                                { value: 25, label: '25' },
                                { value: 50, label: '50' },
                                { value: 100, label: '100' },
                            ]}
                            value={itemsPerPage}
                            onChange={(val: number) => onItemsPerPageChange(Number(val))}
                        />
                    </div>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
                    >
                        <ChevronLeft size={18} />
                    </Button>

                    <div className="hidden sm:flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                            <React.Fragment key={index}>
                                {page === '...' ? (
                                    <span className="px-2 text-gray-500">…</span>
                                ) : (
                                    <button
                                        onClick={() => onPageChange(page as number)}
                                        className={clsx(
                                            'h-8 min-w-[32px] px-3 rounded-lg text-sm font-medium transition-all duration-200',
                                            page === currentPage
                                                ? 'bg-primary/20 text-primary border border-primary/20 shadow-glow'
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        )}
                                    >
                                        {page}
                                    </button>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30"
                    >
                        <ChevronRight size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
