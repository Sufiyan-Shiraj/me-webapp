import React, { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import styles from './ui.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, helperText, fullWidth = true, ...props }, ref) => {
        return (
            <div className={clsx(styles['input-group'], fullWidth && styles['w-full'], className)}>
                {label && <label className={styles.label} htmlFor={props.id}>{label}</label>}
                <input
                    ref={ref}
                    className={clsx(styles.input, error && styles['input-error'])}
                    {...props}
                />
                {error && <span className={styles['error-msg']}>{error}</span>}
                {!error && helperText && <span className={styles['helper-text']}>{helperText}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
