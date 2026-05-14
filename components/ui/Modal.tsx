"use client";

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children, className, footer }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-black/40 transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={clsx(
                "relative w-full max-w-lg transform rounded-3xl border border-gray-100 bg-white shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200",
                "flex flex-col max-h-[90vh]",
                className
            )}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 tracking-tight">{title}</h2>
                        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full w-8 h-8 p-0 flex items-center justify-center"
                    >
                        <X size={18} />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-3xl">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
