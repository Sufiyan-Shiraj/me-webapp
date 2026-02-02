"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkRole: (allowedRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for demo
const MOCK_USER: User = {
    id: 'user-1',
    email: 'admin@company.com',
    name: 'Admin User',
    role: 'admin',
    avatar_url: 'https://ui-avatars.com/api/?name=Admin+User&background=random',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check localStorage on mount
        const storedUser = localStorage.getItem('app_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error('Failed to parse user from local storage');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real app, we would authenticate with Supabase here
        // const { data, error } = await supabase.auth.signInWithPassword({ ... });

        setUser(MOCK_USER);
        localStorage.setItem('app_user', JSON.stringify(MOCK_USER));
        setIsLoading(false);
        router.push('/dashboard');
    };

    const logout = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setUser(null);
        localStorage.removeItem('app_user');
        setIsLoading(false);
        router.push('/login');
    };

    const checkRole = (allowedRoles: Role[]) => {
        if (!user) return false;
        return allowedRoles.includes(user.role);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, checkRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
