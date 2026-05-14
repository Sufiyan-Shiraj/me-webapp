"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps {
    options: Option[];
    value: string | number;
    onChange: (value: any) => void;
    className?: string;
    placeholder?: string;
}

export function Select({ options, value, onChange, className, placeholder = "Select..." }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if clicking inside container or dropdown portal
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
                setCoords({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width
                });
            }
        };

        updateCoords();

        // Use capture phase to catch scroll events from any scrollable parent
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

    return (
        <div className={clsx("relative w-full min-w-[80px]", className)} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-all duration-200 text-sm",
                    "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100 text-gray-900",
                    "focus:outline-none focus:ring-2 focus:ring-gray-900/20",
                    isOpen && "border-gray-900 ring-2 ring-gray-900/20 bg-white shadow-sm",
                    className
                )}
            >
                <span className={clsx("truncate font-medium", !selectedOption && "text-gray-500 font-normal")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={16} className={clsx("ml-2 text-gray-500 transition-transform duration-200", isOpen && "rotate-180 text-gray-900")} />
            </button>

            {/* Dropdown Menu - Rendered in Portal */}
            {isOpen && createPortal(
                <div 
                    ref={dropdownRef}
                    className={clsx(
                        "absolute z-[9999] mt-1 overflow-hidden p-1.5 rounded-2xl bg-white border border-gray-100 shadow-xl origin-top transition-all duration-200 ease-out flex flex-col",
                        isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    )}
                    style={{ 
                        top: `${coords.top}px`, 
                        left: `${coords.left}px`, 
                        width: `${coords.width}px` 
                    }}
                >
                    {/* Search Bar */}
                    <div className="relative mb-1.5 p-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 border-transparent rounded-xl pl-8 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-gray-200 focus:ring-1 focus:ring-gray-200 transition-all"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={clsx(
                                        "w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-xl transition-colors text-left mb-0.5 last:mb-0",
                                        option.value === value
                                            ? "bg-gray-900 text-white font-medium"
                                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.value === value && <Check size={14} />}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-4 text-center text-sm text-gray-500 italic">
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
