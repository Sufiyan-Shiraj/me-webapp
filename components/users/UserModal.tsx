"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { X, Shield, Lock, Eye, EyeOff, Trash2, User, Check, Loader2, AlertCircle } from 'lucide-react';
import { Role } from '@/lib/types';
import { adminUpdateUser, adminChangePassword, deleteUser } from '@/app/actions/userActions';
import clsx from 'clsx';

interface UserModalProps {
    user: any;
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
}

export default function UserModal({ user, isOpen, onClose, onRefresh }: UserModalProps) {
    const [role, setRole] = useState<Role>(user?.role || 'staff');
    const [meAccess, setMeAccess] = useState(user?.me || false);
    const [mayfieldAccess, setMayfieldAccess] = useState(user?.mayfield || false);
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (user) {
            setRole(user.role);
            setMeAccess(user.me);
            setMayfieldAccess(user.mayfield);
            setNewPassword('');
            setStatus(null);
            setShowDeleteConfirm(false);
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleUpdateDetails = async () => {
        setIsLoading(true);
        setStatus(null);
        try {
            const res = await adminUpdateUser(user.id, { role, me: meAccess, mayfield: mayfieldAccess });
            if (res.success) {
                setStatus({ type: 'success', message: 'User updated successfully.' });
                onRefresh();
            } else {
                setStatus({ type: 'error', message: res.message || 'Error updating user.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Unexpected error occurred.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword) return;
        setIsLoading(true);
        setStatus(null);
        try {
            const res = await adminChangePassword(user.id, newPassword);
            if (res.success) {
                setStatus({ type: 'success', message: 'Password updated successfully.' });
                setNewPassword('');
            } else {
                setStatus({ type: 'error', message: res.message || 'Error updating password.' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Unexpected error occurred.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteUser(user.id);
            if (res.success) {
                onRefresh();
                onClose();
            } else {
                setStatus({ type: 'error', message: res.message || 'Error deleting user.' });
                setIsDeleting(false);
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Unexpected error occurred.' });
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
            <div className="relative w-full max-w-[400px] animate-in zoom-in-95 duration-500">
                <Card className="glass-card overflow-hidden rounded-3xl border-white/10 shadow-neon">
                    <CardHeader className="border-b border-white/5 flex flex-col items-center py-8 space-y-4">
                        <div className="relative animate-float">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary via-primary/50 to-accent border-2 border-white/20 flex items-center justify-center text-black text-3xl font-black shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className={clsx(
                                "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-[#0F0F11] flex items-center justify-center shadow-lg",
                                user.role === 'admin' ? "bg-primary" : "bg-gray-500"
                            )}>
                                {user.role === 'admin' ? <Shield size={12} className="text-black" /> : <User size={12} className="text-white" />}
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-white leading-tight tracking-tight">{user.username}</h2>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] mt-1">{user.role} ACCESS</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-all duration-300"
                        >
                            <X size={20} />
                        </button>
                    </CardHeader>

                    <CardBody className="py-6 px-8 space-y-8">
                        {status && (
                            <div className={clsx(
                                "p-4 rounded-2xl text-[11px] font-medium border flex items-center gap-3 animate-in slide-in-from-top-2",
                                status.type === 'success' ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"
                            )}>
                                {status.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {status.message}
                            </div>
                        )}

                        {/* Password Section */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Lock size={12} className="text-primary" /> Security
                            </h3>
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 ml-1">Current Pass</label>
                                        <div className="relative">
                                            <Input 
                                                type={showPassword ? "text" : "password"} 
                                                value={user.password} 
                                                readOnly 
                                                className="bg-black/60 border-white/5 h-10 rounded-xl text-white/80 text-xs font-mono tracking-widest px-4 shadow-none focus:ring-0"
                                            />
                                            <button 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-primary transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-500 ml-1">New Pass</label>
                                        <Input 
                                            placeholder="Update..." 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="bg-black/60 border-white/5 h-10 rounded-xl text-xs px-4 shadow-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                </div>
                                
                                {newPassword && (
                                    <div className="flex justify-center pt-2 animate-in slide-in-from-top-1">
                                        <button 
                                            className="text-[9px] font-black text-gray-500 hover:text-primary transition-all duration-300 flex items-center justify-center gap-2 tracking-[0.2em] py-2 w-full"
                                            onClick={handleUpdatePassword}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 size={14} className="animate-spin" /> : (
                                                <><Check size={14} /> CONFIRM NEW PASSWORD</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Access Section */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Shield size={12} className="text-accent" /> Permissions
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 ml-1">Account Role</label>
                                    <Select 
                                        value={role}
                                        onChange={(val) => setRole(val as Role)}
                                        options={[
                                            { value: 'staff', label: 'Staff Member' },
                                            { value: 'admin', label: 'System Administrator' }
                                        ]}
                                        className="input-premium h-11 rounded-xl text-xs border-white/5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 ml-1">Business Units</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setMeAccess(!meAccess)}
                                            className={clsx(
                                                "flex items-center justify-between p-3.5 rounded-xl border transition-luxury",
                                                meAccess ? "bg-primary/10 border-primary/30 text-white shadow-neon" : "bg-black/20 border-white/5 text-gray-600"
                                            )}
                                        >
                                            <span className="text-xs font-black">ME Ent.</span>
                                            {meAccess && <Check size={14} className="text-primary" />}
                                        </button>
                                        <button 
                                            onClick={() => setMayfieldAccess(!mayfieldAccess)}
                                            className={clsx(
                                                "flex items-center justify-between p-3.5 rounded-xl border transition-luxury",
                                                mayfieldAccess ? "bg-accent/10 border-accent/30 text-white shadow-neon" : "bg-black/20 border-white/5 text-gray-600"
                                            )}
                                        >
                                            <span className="text-xs font-black">Mayfield</span>
                                            {mayfieldAccess && <Check size={14} className="text-accent" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>

                    <CardFooter className="bg-white/[0.02] p-8 flex flex-col gap-4">
                        <Button 
                            className="bg-primary hover:bg-primary/90 text-black font-black h-14 rounded-2xl w-full shadow-neon-hover text-sm tracking-[0.1em] transition-luxury"
                            onClick={handleUpdateDetails}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'SAVE CHANGES'}
                        </Button>

                        <div className="w-full">
                            {!showDeleteConfirm ? (
                                <button 
                                    className="text-[10px] font-black text-gray-600 hover:text-destructive w-full py-2 transition-all duration-300 flex items-center justify-center gap-2 tracking-[0.2em]"
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <Trash2 size={12} /> DELETE ACCOUNT
                                </button>
                            ) : (
                                <div className="flex flex-col items-center gap-3 animate-in zoom-in-95 bg-destructive/10 p-4 rounded-2xl border border-destructive/20">
                                    <span className="text-[10px] text-destructive font-black uppercase tracking-widest">Delete?</span>
                                    <div className="flex gap-3 w-full">
                                        <Button 
                                            className="flex-1 bg-destructive hover:bg-destructive/90 text-white font-bold rounded-xl h-10 text-[11px]"
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : 'YES'}
                                        </Button>
                                        <Button 
                                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl h-10 text-[11px]"
                                            onClick={() => setShowDeleteConfirm(false)}
                                        >
                                            NO
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
