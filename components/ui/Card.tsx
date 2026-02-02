import React from 'react';
import clsx from 'clsx';
import styles from './ui.module.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export function Card({ children, className }: CardProps) {
    return <div className={clsx(styles.card, className)}>{children}</div>;
}

export function CardHeader({ children, className }: CardProps) {
    return <div className={clsx(styles['card-header'], className)}>{children}</div>;
}

export function CardBody({ children, className }: CardProps) {
    return <div className={clsx(styles['card-body'], className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardProps) {
    return <div className={clsx(styles['card-footer'], className)}>{children}</div>;
}
