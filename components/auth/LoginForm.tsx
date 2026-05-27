"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, User } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

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
        <Card className="w-full shadow-lg border border-border bg-surface relative overflow-hidden">
            <CardHeader className="flex-col items-start gap-2 border-b border-border pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-accent/10 border border-accent/20 text-accent shadow-sm">
                        <ShieldCheck size={28} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground tracking-wide">Secure Access</h1>
                        <p className="text-xs text-accent font-bold uppercase tracking-wider">Enterprise Portal</p>
                    </div>
                </div>
                <p className="text-sm text-gray-500">Sign in to manage your inventory and sales.</p>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardBody className="flex flex-col gap-5 py-6">
                    {/* Company Selection */}
                    <div className="flex gap-2 p-1 bg-background/50 rounded-lg border border-border">
                        <button
                            type="button"
                            onClick={() => setCompany('me')}
                            className={clsx(
                                "flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all",
                                company === 'me'
                                    ? "bg-accent text-white shadow-sm"
                                    : "text-foreground opacity-50 hover:opacity-100 hover:bg-background"
                            )}
                        >
                            ME Enterprises
                        </button>
                        <button
                            type="button"
                            onClick={() => setCompany('mayfield')}
                            className={clsx(
                                "flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all",
                                company === 'mayfield'
                                    ? "bg-accent text-white shadow-sm"
                                    : "text-foreground opacity-50 hover:opacity-100 hover:bg-background"
                            )}
                        >
                            Mayfield
                        </button>
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-accent transition-colors">
                            <User size={18} />
                        </div>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-transparent pl-10"
                            inputClassName="!bg-transparent !border-transparent !shadow-none focus:!bg-transparent focus:!border-transparent focus:!ring-0 focus:!shadow-none placeholder:text-gray-500 text-foreground"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-accent transition-colors">
                                <Lock size={18} />
                            </div>
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-transparent pl-10 pr-10"
                                inputClassName="!bg-transparent !border-transparent !shadow-none focus:!bg-transparent focus:!border-transparent focus:!ring-0 focus:!shadow-none placeholder:text-gray-500 text-foreground"
                                required
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div className="flex justify-end">
                            <Link href="#" className="text-xs text-accent hover:text-accent/80 transition-colors font-bold">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-destructive-bg border border-destructive-border text-destructive p-3 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1 font-medium">
                            <Lock size={16} />
                            {error}
                        </div>
                    )}
                </CardBody>

                <CardFooter className="flex flex-col gap-4 bg-background/50 border-t border-border pt-6">
                    <Button
                        type="submit"
                        fullWidth
                        isLoading={isLoading}
                        size="lg"
                        className="font-bold h-12 text-[15px]"
                    >
                        Sign In
                    </Button>
                    <div className="text-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                        Protected by enterprise-grade security
                    </div>
                </CardFooter>
            </form>
        </Card>
    );
}
