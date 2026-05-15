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
import { motion, AnimatePresence } from 'framer-motion';

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
        <AnimatePresence>
        {isOpen && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-[400px]"
            >
                <Card className="bg-surface overflow-hidden rounded-[2rem] border border-border/50 shadow-2xl">
                    <CardHeader className="border-b border-border/50 flex flex-col items-center py-8 space-y-4 bg-foreground/[0.02]">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full bg-foreground/[0.04] border border-border/50 flex items-center justify-center text-foreground text-3xl font-black shadow-sm">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className={clsx(
                                "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-surface flex items-center justify-center shadow-sm",
                                user.role === 'admin' ? "bg-accent" : "bg-foreground/40"
                            )}>
                                {user.role === 'admin' ? <Shield size={12} className="text-white" /> : <User size={12} className="text-white" />}
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-foreground leading-tight tracking-tight">{user.username}</h2>
                            <p className="text-[10px] text-foreground/50 font-bold uppercase tracking-[0.2em] mt-1">{user.role} ACCESS</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-foreground/5 rounded-full text-foreground/40 hover:text-foreground transition-colors duration-200"
                        >
                            <X size={20} strokeWidth={2} />
                        </button>
                    </CardHeader>

                    <CardBody className="py-6 px-8 space-y-8 bg-surface">
                        {status && (
                            <div className={clsx(
                                "p-4 rounded-xl text-xs font-semibold border flex items-center gap-3 animate-in slide-in-from-top-2",
                                status.type === 'success' ? "bg-success-bg text-success border-success-border" : "bg-destructive-bg text-destructive border-destructive-border"
                            )}>
                                {status.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                {status.message}
                            </div>
                        )}

                        {/* Password Section */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Lock size={12} className="text-accent" /> Security
                            </h3>
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-foreground/50 ml-1">Current Pass</label>
                                        <div className="relative">
                                            <Input 
                                                type={showPassword ? "text" : "password"} 
                                                value={user.password} 
                                                readOnly 
                                                className="bg-foreground/[0.02] border-border/50 h-10 rounded-xl text-foreground/60 text-xs font-mono tracking-widest px-4 shadow-none focus:ring-0"
                                            />
                                            <button 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-accent transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-foreground/50 ml-1">New Pass</label>
                                        <Input 
                                            placeholder="Update..." 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="bg-surface border-border/50 h-10 rounded-xl text-xs px-4 shadow-sm focus:border-accent/50 transition-all"
                                        />
                                    </div>
                                </div>
                                
                                {newPassword && (
                                    <div className="flex justify-center pt-2 animate-in slide-in-from-top-1">
                                        <button 
                                            className="text-[10px] font-bold text-foreground/50 hover:text-accent transition-all duration-200 flex items-center justify-center gap-2 tracking-[0.1em] py-2 w-full"
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
                            <h3 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Shield size={12} className="text-accent" /> Permissions
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-foreground/50 ml-1">Account Role</label>
                                    <Select 
                                        value={role}
                                        onChange={(val) => setRole(val as Role)}
                                        options={[
                                            { value: 'staff', label: 'Staff Member' },
                                            { value: 'admin', label: 'System Administrator' }
                                        ]}
                                        className="h-11 rounded-xl text-xs border-border/50 bg-surface"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-foreground/50 ml-1">Business Units</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setMeAccess(!meAccess)}
                                            className={clsx(
                                                "flex items-center justify-between p-3.5 rounded-xl border transition-colors",
                                                meAccess ? "bg-accent/10 border-accent/30 text-accent" : "bg-foreground/[0.02] border-border/50 text-foreground/50 hover:bg-foreground/[0.05]"
                                            )}
                                        >
                                            <span className="text-xs font-bold">ME Ent.</span>
                                            {meAccess && <Check size={14} className="text-accent" />}
                                        </button>
                                        <button 
                                            onClick={() => setMayfieldAccess(!mayfieldAccess)}
                                            className={clsx(
                                                "flex items-center justify-between p-3.5 rounded-xl border transition-colors",
                                                mayfieldAccess ? "bg-accent/10 border-accent/30 text-accent" : "bg-foreground/[0.02] border-border/50 text-foreground/50 hover:bg-foreground/[0.05]"
                                            )}
                                        >
                                            <span className="text-xs font-bold">Mayfield</span>
                                            {mayfieldAccess && <Check size={14} className="text-accent" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>

                    <CardFooter className="bg-foreground/[0.02] p-8 flex flex-col gap-4 border-t border-border/50">
                        <Button 
                            className="w-full font-bold h-12 text-sm tracking-[0.05em]"
                            onClick={handleUpdateDetails}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'SAVE CHANGES'}
                        </Button>

                        <div className="w-full">
                            {!showDeleteConfirm ? (
                                <button 
                                    className="text-[10px] font-bold text-foreground/50 hover:text-destructive w-full py-2 transition-colors duration-200 flex items-center justify-center gap-2 tracking-[0.1em]"
                                    onClick={() => setShowDeleteConfirm(true)}
                                >
                                    <Trash2 size={12} /> DELETE ACCOUNT
                                </button>
                            ) : (
                                <div className="flex flex-col items-center gap-3 animate-in zoom-in-95 bg-destructive-bg p-4 rounded-xl border border-destructive-border">
                                    <span className="text-[10px] text-destructive font-bold uppercase tracking-widest">Delete?</span>
                                    <div className="flex gap-3 w-full">
                                        <Button 
                                            variant="danger"
                                            className="flex-1 font-bold rounded-lg h-9 text-[11px]"
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : 'YES'}
                                        </Button>
                                        <Button 
                                            variant="secondary"
                                            className="flex-1 font-bold rounded-lg h-9 text-[11px] bg-surface border-border text-foreground hover:bg-foreground/5"
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
            </motion.div>
        </div>
        )}
        </AnimatePresence>
    );
}
