"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password: string, company: 'me' | 'mayfield') => Promise<void>;
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

    const login = async (username: string, password: string, company: 'me' | 'mayfield') => {
        setIsLoading(true);

        try {
            // 1. Direct Query to public.users table (Custom Auth)
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('password', password) // Basic plaintext password match as requested
                .single();

            if (userError || !userData) {
                throw new Error('Invalid login credentials');
            }

            // Check if user has access to selected company
            if (!userData[company]) {
                throw new Error(`You do not have access to ${company === 'me' ? 'ME Enterprises' : 'Mayfield'}`);
            }

            // 3. Set User Session
            const appUser: User = {
                id: userData.id,
                email: username + '@' + company + '.com', // Mock email as it's not in the table
                name: userData.username,
                role: userData.admin ? 'admin' : 'staff', // Basic role mapping
                avatar_url: `https://ui-avatars.com/api/?name=${userData.username}&background=random`,
            };

            setUser(appUser);
            localStorage.setItem('app_user', JSON.stringify(appUser));
            router.push('/dashboard');

        } catch (error: any) {
            console.error('Login failed:', error);
            // Re-throw to be handled by UI
            throw error;
        } finally {
            setIsLoading(false);
        }
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
