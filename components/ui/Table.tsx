import React from 'react';
import clsx from 'clsx';
import { ChevronUp, ChevronDown } from 'lucide-react';

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className="w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="w-full overflow-x-auto">
                <table className={clsx('w-full text-sm', className)}>
                    {children}
                </table>
            </div>
        </div>
    );
}

export function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <thead className={clsx('bg-gray-50 border-b border-gray-100', className)}>
            {children}
        </thead>
    );
}

export function TableBody({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <tbody className={clsx('divide-y divide-gray-100 bg-white', className)}>
            {children}
        </tbody>
    );
}

interface TableRowProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    selected?: boolean;
    style?: React.CSSProperties;
}

export function TableRow({ children, className, onClick, selected, style }: TableRowProps) {
    return (
        <tr
            className={clsx(
                'transition-colors duration-200',
                'hover:bg-gray-50',
                onClick && 'cursor-pointer',
                selected && 'bg-info-bg',
                className
            )}
            onClick={onClick}
            style={style}
        >
            {children}
        </tr>
    );
}

interface TableHeadProps {
    children: React.ReactNode;
    className?: string;
    sortable?: boolean;
    sortDirection?: 'asc' | 'desc' | null;
    onSort?: () => void;
}

export function TableHead({ children, className, sortable, sortDirection, onSort }: TableHeadProps) {
    return (
        <th
            className={clsx(
                'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
                sortable && 'cursor-pointer select-none hover:text-gray-900',
                className
            )}
            onClick={sortable ? onSort : undefined}
        >
            <div className="flex items-center gap-2">
                {children}
                {sortable && (
                    <div className="flex flex-col opacity-50">
                        {sortDirection === 'asc' ? (
                            <ChevronUp size={14} className="text-primary opacity-100" />
                        ) : sortDirection === 'desc' ? (
                            <ChevronDown size={14} className="text-primary opacity-100" />
                        ) : (
                            <>
                                <ChevronUp size={12} className="-mb-1" />
                                <ChevronDown size={12} />
                            </>
                        )}
                    </div>
                )}
            </div>
        </th>
    );
}

export function TableCell({ children, className, colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) {
    return (
        <td className={clsx('px-4 py-3 text-sm text-gray-900', className)} colSpan={colSpan}>
            {children}
        </td>
    );
}
