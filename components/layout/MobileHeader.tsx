"use client";

import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MobileHeader({ onMenuClick }: { onMenuClick?: () => void }) {
    return (
        <header className="h-16 bg-white border-b border-border flex md:hidden items-center justify-between px-4 fixed top-0 left-0 right-0 z-40 transition-all duration-300">
            <div className="flex items-center gap-2">
                <ShieldCheck className="text-accent" size={24} />
                <span className="font-bold text-lg text-foreground tracking-wide">SIMS</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onMenuClick} className="text-gray-500 hover:text-foreground hover:bg-gray-100">
                <Menu size={24} />
            </Button>
        </header>
    );
}
