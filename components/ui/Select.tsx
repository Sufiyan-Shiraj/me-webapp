"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';
import clsx from 'clsx';

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
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                    "w-full flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all duration-200 text-sm",
                    "bg-black/20 border-white/10 hover:bg-white/5 hover:border-white/20",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                    isOpen && "border-primary/50 shadow-lg bg-black/40"
                )}
            >
                <span className={clsx("truncate", !selectedOption && "text-gray-500")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={14} className={clsx("ml-2 text-gray-500 transition-transform duration-200", isOpen && "rotate-180 text-primary")} />
            </button>

            {/* Dropdown Menu */}
            <div className={clsx(
                "absolute z-[999] w-full mt-2 overflow-hidden p-1.5 rounded-xl bg-black border border-white/20 shadow-2xl origin-top transition-all duration-300 ease-out flex flex-col",
                isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
            )}>
                {/* Search Bar */}
                <div className="relative mb-1.5 p-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-primary/50 transition-all"
                    />
                </div>

                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={clsx(
                                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left mb-0.5 last:mb-0",
                                    option.value === value
                                        ? "bg-primary/20 text-primary font-medium"
                                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <span className="truncate">{option.label}</span>
                                {option.value === value && <Check size={12} />}
                            </button>
                        ))
                    ) : (
                        <div className="px-3 py-4 text-center text-xs text-gray-500 italic">
                            No results found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
