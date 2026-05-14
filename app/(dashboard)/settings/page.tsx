"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import LoginActivityTable from '@/components/settings/LoginActivityTable';
import RecentActivityTable from '@/components/settings/RecentActivityTable';
import { Shield, Key, Smartphone, Check, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateUserPassword } from '@/app/actions/userActions';
import clsx from 'clsx';

export default function SettingsPage() {
    const { user } = useAuth();
    const isStaff = user?.role === 'staff';
    const [mfaEnabled, setMfaEnabled] = useState(false);
    
    // Password states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleUpdatePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setStatus({ type: 'error', message: 'Please fill in all password fields.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match.' });
            return;
        }

        setIsUpdating(true);
        setStatus(null);

        try {
            const res = await updateUserPassword(user?.id || '', currentPassword, newPassword);
            if (res.success) {
                setStatus({ type: 'success', message: res.message });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setStatus({ type: 'error', message: res.message });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'An unexpected error occurred.' });
        } finally {
            setIsUpdating(false);
        }
    };

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
                        <p className="text-sm text-gray-500">{user?.username}</p>
                        <span className="mt-3 text-[10px] font-bold tracking-widest uppercase bg-white/5 text-gray-300 px-3 py-1 rounded-full border border-white/5">
                            {user?.role}
                        </span>
                    </CardBody>
                </Card>

                {/* Security Settings */}
                <div className="md:col-span-2 space-y-6">

                    {!isStaff && (
                        <Card className="bg-surface backdrop-blur-xl border border-white/5 shadow-glass">
                            <CardHeader className="border-b border-white/5">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <Key size={18} className="text-primary" /> Change Password
                                </h3>
                            </CardHeader>
                            <CardBody className="space-y-4">
                                {status && (
                                    <div className={clsx(
                                        "p-3 rounded-lg text-sm mb-2 border",
                                        status.type === 'success' ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
                                    )}>
                                        {status.message}
                                    </div>
                                )}
                                <Input 
                                    type="password" 
                                    placeholder="Current Password" 
                                    className="bg-black/20 border-white/10" 
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input 
                                        type="password" 
                                        placeholder="New Password" 
                                        className="bg-black/20 border-white/10" 
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <Input 
                                        type="password" 
                                        placeholder="Confirm Password" 
                                        className="bg-black/20 border-white/10" 
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </CardBody>
                            <CardFooter className="flex justify-end border-t border-white/5 pt-4">
                                <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    onClick={handleUpdatePassword}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin mr-2" />
                                            Updating...
                                        </>
                                    ) : 'Update Password'}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {isStaff && (
                        <Card className="bg-surface backdrop-blur-xl border border-white/5 shadow-glass p-6 text-center">
                            <Shield size={40} className="mx-auto text-gray-500 mb-4 opacity-20" />
                            <h3 className="text-lg font-bold text-white mb-1">Security Restricted</h3>
                            <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                Account security settings are managed by system administrators. 
                                Please contact your manager to update your credentials.
                            </p>
                        </Card>
                    )}

                </div>
            </div>
        </div>
    );
}
