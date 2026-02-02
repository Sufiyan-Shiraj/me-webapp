"use client";

import React from 'react';
import { Menu, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function MobileHeader({ onMenuClick }: { onMenuClick?: () => void }) {
    return (
        <header className="h-16 bg-[var(--surface-dark)] backdrop-blur-md border-b border-white/5 flex md:hidden items-center justify-between px-4 fixed top-0 left-0 right-0 z-40 transition-all duration-300">
            <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary" size={24} />
                <span className="font-bold text-lg text-white tracking-wide">SIMS</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onMenuClick} className="text-gray-400 hover:text-white hover:bg-white/10">
                <Menu size={24} />
            </Button>
        </header>
    );
}
