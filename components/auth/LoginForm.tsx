"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Lock, Mail, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
    const { login } = useAuth();
    const [company, setCompany] = useState<'me' | 'mayfield'>('me');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (!username || !password) {
                throw new Error('Please fill in all fields');
            }
            await login(username, password, company);
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.message === 'Invalid login credentials') {
                setError('Invalid username or password. Please try again.');
            } else if (err.message.includes('not have access')) {
                setError(err.message);
            } else {
                setError('Failed to login. Please check your connection and try again.');
            }
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full shadow-2xl border border-white/10 bg-black/40 backdrop-blur-xl relative overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <CardHeader className="flex-col items-start gap-2 border-b border-white/5 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 text-primary shadow-lg shadow-primary/10">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-wide">Secure Access</h1>
                        <p className="text-xs text-primary/80 font-medium uppercase tracking-wider">Enterprise Portal</p>
                    </div>
                </div>
                <p className="text-sm text-gray-400">Sign in to manage your inventory and sales.</p>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardBody className="flex flex-col gap-5 py-6">
                    {/* Company Selection */}
                    <div className="flex gap-2 p-1 bg-black/20 rounded-lg border border-white/5">
                        <button
                            type="button"
                            onClick={() => setCompany('me')}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${company === 'me'
                                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            ME Enterprises
                        </button>
                        <button
                            type="button"
                            onClick={() => setCompany('mayfield')}
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${company === 'mayfield'
                                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Mayfield
                        </button>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                            <Mail size={18} />
                        </div>
                        <Input
                            id="username"
                            type="text"
                            // label="Username"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-black/20 border-white/10 pl-10 focus:border-primary/50 placeholder:text-gray-600"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                <Lock size={18} />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                // label="Password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-black/20 border-white/10 pl-10 pr-10 focus:border-primary/50 placeholder:text-gray-600"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <Link href="#" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                            <Lock size={16} />
                            {error}
                        </div>
                    )}
                </CardBody>

                <CardFooter className="flex flex-col gap-4 bg-white/5 border-t border-white/5 pt-6">
                    <Button
                        type="submit"
                        fullWidth
                        isLoading={isLoading}
                        size="lg"
                        className="bg-gradient-to-r from-primary to-accent hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 border-none text-black font-bold"
                    >
                        Sign In
                    </Button>
                    <div className="text-center text-[10px] text-gray-500 uppercase tracking-widest">
                        Protected by enterprise-grade security
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
