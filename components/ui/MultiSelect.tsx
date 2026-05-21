"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';

interface Option {
    value: string;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    values: string[];
    onChange: (values: string[]) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

export function MultiSelect({ options, values, onChange, className, placeholder = "All Locations", disabled = false }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, renderUpwards: false });
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                (containerRef.current && containerRef.current.contains(event.target as Node)) ||
                (dropdownRef.current && dropdownRef.current.contains(event.target as Node))
            ) {
                return;
            }
            setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        
        const updateCoords = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const dropdownHeight = 300; 
                const renderUpwards = spaceBelow < dropdownHeight && rect.top > spaceBelow;
                
                setCoords({
                    top: renderUpwards ? rect.top + window.scrollY : rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    renderUpwards
                });
            }
        };

        updateCoords();
        window.addEventListener('scroll', updateCoords, true);
        window.addEventListener('resize', updateCoords);
        return () => {
            window.removeEventListener('scroll', updateCoords, true);
            window.removeEventListener('resize', updateCoords);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
        if (!isOpen) {
            setSearchQuery('');
        }
    }, [isOpen]);

    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleOption = (val: string) => {
        if (values.includes(val)) {
            onChange(values.filter(v => v !== val));
        } else {
            onChange([...values, val]);
        }
    };

    const toggleAll = () => {
        if (values.length === options.length) {
            onChange([]);
        } else {
            onChange(options.map(o => o.value));
        }
    };

    const getDisplayText = () => {
        if (values.length === 0) return placeholder;
        if (values.length === options.length) return placeholder;
        if (values.length === 1) {
            const opt = options.find(o => o.value === values[0]);
            return opt ? opt.label : placeholder;
        }
        return `${values.length} Selected`;
    };

    return (
        <div className={clsx("relative w-full min-w-[120px]", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-200 text-sm",
                    "bg-gray-50 border-border/50 text-foreground",
                    disabled ? "opacity-50 cursor-not-allowed" : "hover:border-border hover:bg-foreground/[0.04] focus:outline-none focus:ring-2 focus:ring-accent/20",
                    isOpen && !disabled && "border-accent ring-2 ring-accent/20 bg-background shadow-sm",
                    className
                )}
            >
                <span className={clsx("truncate font-medium", values.length === 0 && "text-gray-500 font-normal")}>
                    {getDisplayText()}
                </span>
                <ChevronDown size={16} className={clsx("ml-2 text-gray-500 transition-transform duration-200", isOpen && "rotate-180 text-foreground")} />
            </button>

            {isOpen && createPortal(
                <div 
                    ref={dropdownRef}
                    className={clsx(
                        "absolute z-[9999] overflow-hidden p-1.5 rounded-2xl bg-background border border-border shadow-xl flex flex-col",
                        coords.renderUpwards ? "origin-bottom" : "origin-top",
                        isOpen ? (coords.renderUpwards ? "animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200" : "animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200") : "opacity-0 pointer-events-none"
                    )}
                    style={{ 
                        top: `${coords.top}px`, 
                        left: `${coords.left}px`, 
                        width: `${coords.width}px`,
                        minWidth: '240px',
                        transform: coords.renderUpwards ? 'translateY(calc(-100% - 8px))' : 'translateY(4px)'
                    }}
                >
                    <div className="relative mb-1.5 p-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-100 border-transparent rounded-xl pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        <button
                            type="button"
                            onClick={toggleAll}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-colors text-left mb-1 hover:bg-gray-100 font-semibold"
                        >
                            <span>{values.length === options.length ? "Deselect All" : "Select All"}</span>
                            <div className={clsx(
                                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                values.length === options.length ? "bg-accent border-accent text-white" : "border-gray-300"
                            )}>
                                {values.length === options.length && <Check size={12} strokeWidth={3} />}
                            </div>
                        </button>
                        <div className="h-px bg-border/50 mx-2 mb-1" />
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = values.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => toggleOption(option.value)}
                                        className={clsx(
                                            "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-colors text-left mb-0.5 last:mb-0",
                                            isSelected
                                                ? "bg-accent/5 text-accent font-medium"
                                                : "text-gray-700 hover:bg-gray-100 hover:text-foreground"
                                        )}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        <div className={clsx(
                                            "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                            isSelected ? "bg-accent border-accent text-white" : "border-gray-300"
                                        )}>
                                            {isSelected && <Check size={12} strokeWidth={3} />}
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-3 py-4 text-center text-sm text-foreground/50 italic">
                                No results found
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
