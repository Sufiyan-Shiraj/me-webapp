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

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // 1. Initial Session Check
        const checkSession = async () => {
            const savedUser = localStorage.getItem('app_user');
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);
                    setIsLoading(false);
                    return;
                } catch (e) {
                    localStorage.removeItem('app_user');
                }
            }
            setIsLoading(false);
        };

        checkSession();
    }, []);

    const login = async (username: string, password: string, company: 'me' | 'mayfield') => {
        setIsLoading(true);

        try {


            const cleanUsername = username.trim();
            const cleanPassword = password.trim();

            // Check database for user using API
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            const profile = data.user;
            const token = data.token;

            if (!profile[company]) {
                throw new Error(`You do not have access to ${company === 'me' ? 'ME Enterprises' : 'Mayfield'}`);
            }

            setUser(profile);
            localStorage.setItem('app_user', JSON.stringify(profile));
            localStorage.setItem('app_token', token);

            router.push('/dashboard');
        } catch (error: any) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        localStorage.removeItem('app_user');
        localStorage.removeItem('app_token');
        localStorage.removeItem('dev_user');
        setUser(null);
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
