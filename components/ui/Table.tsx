import React from 'react';
import clsx from 'clsx';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Enhanced Table component with glassmorphic styling
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className="w-full overflow-hidden rounded-xl border border-border bg-surface backdrop-blur-xl shadow-glass">
            <div className="w-full overflow-x-auto">
                <table className={clsx('w-full', className)}>
                    {children}
                </table>
            </div>
        </div>
    );
}

export function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <thead className={clsx('bg-black/20 border-b border-border backdrop-blur-sm', className)}>
            {children}
        </thead>
    );
}

export function TableBody({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <tbody className={clsx('divide-y divide-border', className)}>
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
                'transition-all duration-200',
                'hover:bg-primary/5 hover:shadow-[inset_0_0_0_1px_rgba(6,182,212,0.1)]',
                onClick && 'cursor-pointer',
                selected && 'bg-primary/10 shadow-[inset_0_0_0_1px_rgba(6,182,212,0.2)]',
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
                'px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider',
                sortable && 'cursor-pointer select-none hover:text-primary transition-colors',
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
        <td className={clsx('px-6 py-4 text-sm text-foreground', className)} colSpan={colSpan}>
            {children}
        </td>
    );
}
