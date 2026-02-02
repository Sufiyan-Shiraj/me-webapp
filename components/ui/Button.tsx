import React, { ButtonHTMLAttributes } from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import styles from './ui.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    fullWidth?: boolean;
    icon?: LucideIcon;
    rightIcon?: LucideIcon;
}

export function Button({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    icon: Icon,
    rightIcon: IconRight,
    children,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={clsx(
                styles.btn,
                styles[`btn-${variant}`],
                styles[`btn-${size}`],
                fullWidth && styles['btn-full'],
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className={styles.spinner} />}
            {!isLoading && Icon && <Icon size={size === 'sm' ? 14 : 16} />}
            {children}
            {!isLoading && IconRight && <IconRight size={size === 'sm' ? 14 : 16} />}
        </button>
    );
}
