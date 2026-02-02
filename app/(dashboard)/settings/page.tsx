"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import LoginActivityTable from '@/components/settings/LoginActivityTable';
import { Shield, Key, Smartphone, Check, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

export default function SettingsPage() {
    const { user } = useAuth();
    const [mfaEnabled, setMfaEnabled] = useState(false);

    return (
        <div className="container mx-auto space-y-8 max-w-5xl">
            <div>
                <h1 className="text-3xl font-sans font-bold tracking-tight text-white">Account Settings</h1>
                <p className="text-gray-400 mt-1">Manage security and account preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Profile Card */}
                <Card className="md:col-span-1 h-fit bg-surface backdrop-blur-xl border border-white/5 shadow-glass">
                    <CardHeader className="border-b border-white/5">
                        <h3 className="font-semibold text-white">Profile</h3>
                    </CardHeader>
                    <CardBody className="flex flex-col items-center py-8">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center text-primary text-3xl font-bold mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                            {user?.name?.charAt(0) || <User size={40} />}
                        </div>
                        <h4 className="text-xl font-bold text-white">{user?.name}</h4>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                        <span className="mt-3 text-[10px] font-bold tracking-widest uppercase bg-white/5 text-gray-300 px-3 py-1 rounded-full border border-white/5">
                            {user?.role}
                        </span>
                    </CardBody>
                </Card>

                {/* Security Settings */}
                <div className="md:col-span-2 space-y-6">

                    {/* Change Password */}
                    <Card className="bg-surface backdrop-blur-xl border border-white/5 shadow-glass">
                        <CardHeader className="border-b border-white/5">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Key size={18} className="text-primary" /> Change Password
                            </h3>
                        </CardHeader>
                        <CardBody className="space-y-4">
                            <Input type="password" placeholder="Current Password" className="bg-black/20 border-white/10" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input type="password" placeholder="New Password" className="bg-black/20 border-white/10" />
                                <Input type="password" placeholder="Confirm Password" className="bg-black/20 border-white/10" />
                            </div>
                        </CardBody>
                        <CardFooter className="flex justify-end border-t border-white/5 pt-4">
                            <Button variant="secondary" size="sm">Update Password</Button>
                        </CardFooter>
                    </Card>

                    {/* MFA */}
                    <Card className="bg-surface backdrop-blur-xl border border-white/5 shadow-glass">
                        <CardHeader className="border-b border-white/5">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Shield size={18} className="text-accent" /> Two-Factor Authentication
                            </h3>
                        </CardHeader>
                        <CardBody>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-white">Secure your account</p>
                                    <p className="text-sm text-gray-400">
                                        Add an extra layer of security by requiring a code from your phone.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setMfaEnabled(!mfaEnabled)}
                                    className={clsx(
                                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                        mfaEnabled ? 'bg-primary shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-gray-700'
                                    )}
                                >
                                    <span className={clsx(
                                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                        mfaEnabled ? 'translate-x-5' : 'translate-x-0'
                                    )} />
                                </button>
                            </div>
                            {mfaEnabled && (
                                <div className="mt-6 p-4 bg-black/40 border border-white/10 rounded-xl flex flex-col md:flex-row items-center md:items-start gap-6 animate-in fade-in slide-in-from-top-2">
                                    <div className="p-2 bg-white rounded-lg">
                                        <div className="w-24 h-24 bg-gray-900 grid place-items-center text-white text-[10px]">QR CODE</div>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <p className="text-sm font-medium text-white">Scan this QR Code</p>
                                            <p className="text-xs text-gray-400">Use Google Authenticator or Authy App</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input placeholder="123 456" className="w-32 bg-black/20 border-white/10 text-center tracking-widest" />
                                            <Button size="sm">Verify</Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Login Activity */}
                    <LoginActivityTable />

                </div>
            </div>
        </div>
    );
}
