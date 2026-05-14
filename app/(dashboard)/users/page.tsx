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
    
    const [users, setUsers] = useState<any[]>([]);
    const [isFetchingUsers, setIsFetchingUsers] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
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
            fetchUsers();
        } else {
            setMessage({ type: 'error', text: result.message || 'Error occurred.' });
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-foreground tracking-tight">User Management</h1>
                <p className="text-gray-500">Create, manage and monitor system access.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Card className="lg:col-span-1 bg-white border-border shadow-sm overflow-hidden h-fit sticky top-8">
                    <CardHeader className="border-b border-border pb-4">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-accent/10 text-accent">
                                <UserPlus size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-foreground">Add New User</h2>
                        </div>
                    </CardHeader>
                    <CardBody className="py-6">
                        <form onSubmit={handleFormSubmit} className="space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <UserIcon size={14} className="text-gray-400" /> Username
                                    </label>
                                    <Input 
                                        name="username" 
                                        type="text" 
                                        placeholder="username123" 
                                        className="bg-white" 
                                        required 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Lock size={14} className="text-gray-400" /> Password
                                    </label>
                                    <Input 
                                        name="password" 
                                        type="password" 
                                        placeholder="••••••••" 
                                        className="bg-white" 
                                        required 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-gray-400" /> System Role
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

                                <div className="flex flex-col gap-4 mt-4 p-4 rounded-xl bg-gray-50 border border-border">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Entity Access</label>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" name="me" defaultChecked className="hidden peer" />
                                            <div className="w-5 h-5 rounded border border-border flex items-center justify-center bg-white group-hover:border-accent/50 transition-all peer-checked:bg-accent peer-checked:border-accent">
                                                <Check size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                                            </div>
                                            <span className="text-sm text-gray-600 peer-checked:text-foreground font-medium transition-colors">ME Enterprises</span>
                                        </label>
                                        
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" name="mayfield" className="hidden peer" />
                                            <div className="w-5 h-5 rounded border border-border flex items-center justify-center bg-white group-hover:border-accent/50 transition-all peer-checked:bg-accent peer-checked:border-accent">
                                                <Check size={14} className="text-white opacity-0 peer-checked:opacity-100" />
                                            </div>
                                            <span className="text-sm text-gray-600 peer-checked:text-foreground font-medium transition-colors">Mayfield</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {message && (
                                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in zoom-in-95 duration-200 ${
                                    message.type === 'success' ? 'bg-success-bg text-success border border-success-border' : 'bg-destructive-bg text-destructive border border-destructive-border'
                                }`}>
                                    {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
                                    <span className="text-sm font-medium">{message.text}</span>
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full font-bold h-12" 
                                disabled={isLoading}
                            >
                                {isLoading ? <div className="flex items-center justify-center gap-2 w-full"><Loader2 className="animate-spin" size={18}/> Creating User...</div> : 'Create User Account'}
                            </Button>
                        </form>
                    </CardBody>
                </Card>

                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-white border-border shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-border pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div 
                                    className="p-2 rounded-lg bg-gray-50 text-gray-500 cursor-pointer hover:bg-gray-100 hover:text-accent transition-colors border border-border"
                                    onClick={() => setIsUsersCollapsed(!isUsersCollapsed)}
                                    title={isUsersCollapsed ? "Maximize" : "Minimize"}
                                >
                                    <UserIcon size={20} className={clsx("transition-transform duration-300", isUsersCollapsed && "rotate-180")} />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Active Users</h2>
                            </div>
                            {!isUsersCollapsed && (
                                <div className="relative w-full sm:w-64 animate-in fade-in duration-300">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <Input 
                                        placeholder="Search users..." 
                                        className="pl-10 text-sm h-9" 
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
                                                            <Loader2 className="animate-spin mx-auto text-accent mb-2" size={24} />
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
                                                            className="group hover:bg-gray-50 transition-colors cursor-pointer"
                                                            onClick={() => handleUserClick(u)}
                                                        >
                                                            <TableCell>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full bg-gray-100 border border-border flex items-center justify-center text-xs font-bold text-gray-700 group-hover:bg-accent/10 group-hover:text-accent group-hover:border-accent/20 transition-colors">
                                                                        {u.username.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <span className="font-semibold text-foreground">{u.username}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className={clsx(
                                                                    "text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider",
                                                                    u.role === 'admin' 
                                                                        ? "bg-accent/10 text-accent border-accent/20" 
                                                                        : "bg-gray-100 text-gray-600 border-border"
                                                                )}>
                                                                    {u.role}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-1.5">
                                                                    {u.me && <span className="w-2.5 h-2.5 rounded-full bg-success shadow-sm" title="ME Enterprises" />}
                                                                    {u.mayfield && <span className="w-2.5 h-2.5 rounded-full bg-accent shadow-sm" title="Mayfield" />}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-right text-sm text-gray-500 font-medium">
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
