"use client";

import React from 'react';
import clsx from 'clsx';
import styles from '@/components/ui/ui.module.css';

interface RadioOption {
    label: string;
    value: string;
    description?: string;
}

interface RadioGroupProps {
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
    name: string;
    className?: string;
}

export function RadioGroup({ options, value, onChange, name, className }: RadioGroupProps) {
    return (
        <div className={clsx("flex flex-col gap-3", className)}>
            {options.map((option) => {
                const isSelected = value === option.value;
                return (
                    <label
                        key={option.value}
                        className={clsx(
                            "relative flex items-center p-3 rounded-xl border transition-all duration-200 cursor-pointer group",
                            isSelected
                                ? "bg-primary/5 border-primary/30 shadow-[inset_0_0_0_1px_rgba(6,182,212,0.1)]"
                                : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
                        )}
                        onClick={() => onChange(option.value)}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={isSelected}
                            onChange={() => onChange(option.value)}
                            className="sr-only"
                        />

                        <div className={clsx(
                            "flex items-center justify-center w-5 h-5 rounded-full border mr-3 transition-all",
                            isSelected
                                ? "border-primary bg-primary/20 shadow-glow"
                                : "border-gray-600 group-hover:border-gray-500"
                        )}>
                            <div className={clsx(
                                "w-2.5 h-2.5 rounded-full bg-primary transition-transform duration-200",
                                isSelected ? "scale-100" : "scale-0"
                            )} />
                        </div>

                        <div className="flex flex-col">
                            <span className={clsx(
                                "text-sm font-medium transition-colors",
                                isSelected ? "text-foreground" : "text-gray-400 group-hover:text-gray-300"
                            )}>
                                {option.label}
                            </span>
                            {option.description && (
                                <span className="text-xs text-gray-500 mt-0.5">
                                    {option.description}
                                </span>
                            )}
                        </div>
                    </label>
                );
            })}
        </div>
    );
}
