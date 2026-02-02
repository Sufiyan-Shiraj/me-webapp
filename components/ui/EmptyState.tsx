import React from 'react';
import { PackageOpen, SearchX, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import clsx from 'clsx';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    variant?: 'no-data' | 'no-results' | 'error';
}

export function EmptyState({ icon, title, description, action, variant = 'no-data' }: EmptyStateProps) {
    const defaultIcons = {
        'no-data': <PackageOpen size={48} className="text-gray-600" />,
        'no-results': <SearchX size={48} className="text-gray-600" />,
        'error': <AlertCircle size={48} className="text-destructive" />,
    };

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="mb-4 opacity-50">
                {icon || defaultIcons[variant]}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-gray-400 text-center max-w-md mb-6">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick} size="sm">
                    {action.label}
                </Button>
            )}
        </div>
    );
}
