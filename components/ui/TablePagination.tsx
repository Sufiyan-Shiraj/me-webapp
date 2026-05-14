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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white rounded-b-3xl">
            <div className="text-sm text-gray-500 font-medium">
                Showing <span className="font-bold text-gray-900">{startItem}</span> to{' '}
                <span className="font-bold text-gray-900">{endItem}</span> of{' '}
                <span className="font-bold text-gray-900">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-6">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-medium">Per page:</span>
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
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <div className="hidden sm:flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                            <React.Fragment key={index}>
                                {page === '...' ? (
                                    <span className="px-2 text-gray-400">…</span>
                                ) : (
                                    <button
                                        onClick={() => onPageChange(page as number)}
                                        className={clsx(
                                            'h-8 min-w-[32px] px-3 rounded-lg text-sm font-semibold transition-all duration-200 border',
                                            page === currentPage
                                                ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                                                : 'text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-100'
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
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
