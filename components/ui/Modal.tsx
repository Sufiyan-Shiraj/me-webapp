"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
    footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children, className, maxWidth = "max-w-lg", footer }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Backdrop */}
                    <motion.div
                        ref={overlayRef}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={clsx(
                            "relative w-full transform rounded-[2rem] border border-border/50 bg-surface shadow-2xl flex flex-col max-h-[90vh]",
                            maxWidth,
                            className
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/50">
                            <div>
                                <h2 className="text-xl font-semibold text-foreground tracking-tight">{title}</h2>
                                {description && <p className="mt-1 text-sm text-foreground/60">{description}</p>}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-full w-10 h-10 p-0 flex items-center justify-center transition-colors shrink-0 ml-4"
                            >
                                <X size={20} strokeWidth={2} />
                            </Button>
                        </div>

                        {/* Body */}
                        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-border/50 bg-foreground/[0.02] rounded-b-[2rem]">
                                {footer}
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
