"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { UserPlus, ShieldCheck, Lock, User as UserIcon, Check, X, ShieldAlert, Loader2, Search, Mail, Shield } from 'lucide-react';
import { createNewUser, getAllUsers } from '@/app/actions/userActions';
import { useAuth } from '@/context/AuthContext';
import { Select } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import RecentActivityTable from '@/components/settings/RecentActivityTable';
import UserModal from '@/components/users/UserModal';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function UsersPage() {
    const { checkRole } = useAuth();
    const isAdmin = checkRole(['admin']);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState('staff');
    
    // User List State
    const [users, setUsers] = useState<any[]>([]);
    const [isFetchingUsers, setIsFetchingUsers] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Collapsible State
    const [isUsersCollapsed, setIsUsersCollapsed] = useState(false);

    const fetchUsers = async () => {
        setIsFetchingUsers(true);
        const res = await getAllUsers();
        if (res.success) {
            setUsers(res.users || []);
        }
        setIsFetchingUsers(false);
    };

    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    const handleUserClick = (user: any) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery]);

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <ShieldAlert size={64} className="text-destructive mb-4" />
                <h1 className="text-2xl font-bold text-white">Access Denied</h1>
                <p className="text-gray-500 max-w-md">
                    Only administrators have access to user management. Please contact an administrator if you believe this is an error.
                </p>
                <Button variant="secondary" onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const result = await createNewUser(formData);

        if (result.success) {
            setMessage({ type: 'success', text: result.message || 'User created successfully.' });
            e.currentTarget.reset();
            setRole('staff');
            fetchUsers(); // Refresh list
        } else {
            setMessage({ type: 'error', text: result.message || 'Error occurred.' });
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">User Management</h1>
                <p className="text-gray-500">Create, manage and monitor system access.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Form to Create User */}
                <Card className="lg:col-span-1 bg-surface/40 backdrop-blur-xl border-white/5 shadow-glass overflow-hidden h-fit sticky top-8">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                <UserPlus size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-white">Add New User</h2>
                        </div>
                    </CardHeader>
                    <CardBody className="py-6">
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                        <UserIcon size={14} /> Username
                                    </label>
                                    <Input 
                                        name="username" 
                                        type="text" 
                                        placeholder="username123" 
                                        className="bg-black/20 border-white/10" 
                                        required 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                        <Lock size={14} /> Password
                                    </label>
                                    <Input 
                                        name="password" 
                                        type="password" 
                                        placeholder="••••••••" 
                                        className="bg-black/20 border-white/10" 
                                        required 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                        <ShieldCheck size={14} /> System Role
                                    </label>
                                    <input type="hidden" name="role" value={role} />
                                    <Select 
                                        value={role} 
                                        onChange={setRole}
                                        options={[
                                            { value: 'staff', label: 'Staff (Sales/Inventory View)' },
                                            { value: 'admin', label: 'Administrator (Full Access)' }
                                        ]}
                                        className="z-50"
                                    />
                                </div>

                                <div className="flex flex-col gap-4 mt-4 p-4 rounded-xl bg-white/5 border border-white/5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Entity Access</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" name="me" defaultChecked className="hidden peer" />
                                            <div className="w-5 h-5 rounded border border-white/10 flex items-center justify-center bg-black/40 group-hover:border-primary/50 transition-all peer-checked:bg-primary peer-checked:border-primary">
                                                <Check size={14} className="text-black opacity-0 peer-checked:opacity-100" />
                                            </div>
                                            <span className="text-sm text-gray-400 peer-checked:text-white transition-colors">ME Enterprises</span>
                                        </label>
                                        
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" name="mayfield" className="hidden peer" />
                                            <div className="w-5 h-5 rounded border border-white/10 flex items-center justify-center bg-black/40 group-hover:border-primary/50 transition-all peer-checked:bg-primary peer-checked:border-primary">
                                                <Check size={14} className="text-black opacity-0 peer-checked:opacity-100" />
                                            </div>
                                            <span className="text-sm text-gray-400 peer-checked:text-white transition-colors">Mayfield</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in zoom-in-95 duration-200 ${
                                    message.type === 'success' ? 'bg-success/20 text-success border border-success/20' : 'bg-destructive/20 text-destructive border border-destructive/20'
                                }`}>
                                    {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
                                    <span className="text-sm font-medium">{message.text}</span>
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full bg-gradient-to-r from-primary to-accent text-black font-bold h-12 shadow-lg shadow-primary/20" 
                                disabled={isLoading}
                            >
                                {isLoading ? <div className="flex items-center gap-2"><Loader2 className="animate-spin" size={18}/> Creating User...</div> : 'Create User Account'}
                            </Button>
                        </form>
                    </CardBody>
                </Card>

                {/* User List and Activity */}
                <div className="lg:col-span-2 space-y-8">
                    {/* User List Card */}
                    <Card className="bg-surface/40 backdrop-blur-xl border-white/5 shadow-glass overflow-hidden">
                        <CardHeader className="border-b border-white/5 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div 
                                    className="p-2 rounded-lg bg-accent/20 text-accent cursor-pointer hover:bg-accent/30 transition-colors"
                                    onClick={() => setIsUsersCollapsed(!isUsersCollapsed)}
                                    title={isUsersCollapsed ? "Maximize" : "Minimize"}
                                >
                                    <UserIcon size={20} className={clsx("transition-transform duration-300", isUsersCollapsed && "rotate-180")} />
                                </div>
                                <h2 className="text-xl font-bold text-white">Active Users</h2>
                            </div>
                            {!isUsersCollapsed && (
                                <div className="relative w-full sm:w-64 animate-in fade-in duration-300">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <Input 
                                        placeholder="Search users..." 
                                        className="pl-10 bg-black/20 border-white/10 text-sm h-9" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            )}
                        </CardHeader>
                        <AnimatePresence>
                            {!isUsersCollapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                >
                                    <CardBody className="p-0">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>User</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>Access</TableHead>
                                                    <TableHead className="text-right">Joined</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isFetchingUsers ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-12">
                                                            <Loader2 className="animate-spin mx-auto text-primary mb-2" size={24} />
                                                            <span className="text-sm text-gray-500">Loading user records...</span>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : filteredUsers.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-12 text-gray-500">
                                                            No users found matching "{searchQuery}"
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredUsers.map((u, idx) => (
                                                        <TableRow 
                                                            key={u.id} 
                                                            className="group hover:bg-white/5 transition-colors cursor-pointer"
                                                            onClick={() => handleUserClick(u)}
                                                        >
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                                                                        {u.username.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="font-medium text-white">{u.username}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className={clsx(
                                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                                                                    u.role === 'admin' 
                                                                        ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]" 
                                                                        : "bg-gray-500/10 text-gray-400 border-white/10"
                                                                )}>
                                                                    {u.role}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-1.5">
                                                                    {u.me && <span className="w-2 h-2 rounded-full bg-success" title="ME Enterprises" />}
                                                                    {u.mayfield && <span className="w-2 h-2 rounded-full bg-accent" title="Mayfield" />}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right text-sm text-gray-500">
                                                                {new Date(u.created_at).toLocaleDateString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardBody>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>

                    {/* Login Activity Card */}
                    <div className="pt-4">
                        <RecentActivityTable />
                    </div>
                </div>
            </div>

            <UserModal 
                user={selectedUser} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onRefresh={fetchUsers}
            />
        </div>
    );
}
