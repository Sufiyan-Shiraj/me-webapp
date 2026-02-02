"use client";

import React from 'react';
import { Check } from 'lucide-react';
import clsx from 'clsx';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, checked, onChange, disabled, ...props }, ref) => {
        // Handle click on custom element to trigger hidden input
        const checkboxRef = React.useRef<HTMLInputElement>(null);

        const handleClick = () => {
            if (!disabled && checkboxRef.current) {
                checkboxRef.current.click();
            }
        };

        return (
            <label className={clsx("inline-flex items-center gap-2 cursor-pointer group", disabled && "opacity-50 cursor-not-allowed", className)}>
                <div className="relative">
                    <input
                        type="checkbox"
                        ref={(node) => {
                            // Maintain both internal and external refs
                            // @ts-ignore
                            checkboxRef.current = node;
                            if (typeof ref === 'function') ref(node);
                            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
                        }}
                        className="sr-only peer" // Sr-only hides it but keeps it accessible and form-submittable
                        checked={checked}
                        onChange={onChange}
                        disabled={disabled}
                        {...props}
                    />
                    {/* Custom Checkbox Design */}
                    <div className={clsx(
                        "w-5 h-5 rounded-md border transition-all duration-200 flex items-center justify-center",
                        "bg-white/5 border-white/10 group-hover:border-primary/50 shadow-sm",
                        "peer-checked:bg-gradient-to-br peer-checked:from-primary peer-checked:to-accent peer-checked:border-transparent peer-checked:shadow-[0_0_10px_rgba(6,182,212,0.4)]",
                        "peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50"
                    )}>
                        <Check size={12} className={clsx("text-black stroke-[3px] transition-transform duration-200 scale-0", checked && "scale-100")} />
                    </div>
                </div>
                {label && <span className="text-sm text-gray-300 group-hover:text-white select-none">{label}</span>}
            </label>
        );
    }
);

Checkbox.displayName = 'Checkbox';
