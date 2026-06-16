import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Database, Download, Upload, AlertTriangle, Check, X, Loader2, FileJson, ChevronRight, LayoutList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type DiffData = {
    additions: number;
    deletions: number;
    modifications: number;
    totalBackup: number;
    totalLive: number;
};

export default function BackupRestoreCard() {
    const [isExporting, setIsExporting] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportPassword, setExportPassword] = useState('');

    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
    const [restoreState, setRestoreState] = useState<'select' | 'loading' | 'diff' | 'password' | 'restoring'>('select');
    const [restorePassword, setRestorePassword] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [backupData, setBackupData] = useState<any>(null);
    const [diffs, setDiffs] = useState<Record<string, DiffData> | null>(null);
    const [activeTab, setActiveTab] = useState<string>('Summary');
    
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!exportPassword) return;

        setIsExporting(true);
        setMessage(null);
        try {
            const res = await fetch('/api/backup/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: exportPassword })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to export backup');
            }
            
            const data = await res.json();
            const { filename, data: backupPayload } = data;

            const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            setMessage({ type: 'success', text: 'Backup downloaded successfully!' });
            setIsExportModalOpen(false);
            setExportPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setRestoreState('loading');
        setMessage(null);

        try {
            const fileText = await file.text();
            const parsedData = JSON.parse(fileText);
            setBackupData(parsedData);

            const token = localStorage.getItem('app_token');
            const res = await fetch('/api/backup/diff', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ backupData: parsedData })
            });

            const diffData = await res.json();
            if (!res.ok) throw new Error(diffData.error || 'Failed to compute diff');

            setDiffs(diffData.diffs);
            setRestoreState('diff');
            setActiveTab('Summary');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
            setRestoreState('select');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const executeRestore = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!backupData || !restorePassword) return;

        setRestoreState('restoring');
        setMessage(null);

        try {
            const res = await fetch('/api/backup/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: restorePassword, backupData })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to restore backup');

            setMessage({ type: 'success', text: 'Database restored successfully! Please refresh the page.' });
            setIsRestoreModalOpen(false);
            resetRestoreModal();
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
            setRestoreState('password');
        }
    };

    const resetRestoreModal = () => {
        setRestoreState('select');
        setRestorePassword('');
        setSelectedFile(null);
        setBackupData(null);
        setDiffs(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const renderDiffTabs = () => {
        if (!diffs) return null;
        const tables = Object.keys(diffs);
        const tabs = [...tables, 'Summary'];

        return (
            <div className="flex flex-col h-full max-h-[60vh] overflow-hidden">
                {/* Browser-like Tabs */}
                        <div className="flex overflow-x-auto gap-2 border-b border-border hide-scrollbar bg-gray-50 pt-3 px-3 shrink-0">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2.5 text-sm font-bold transition-all whitespace-nowrap rounded-t-xl
                                        ${activeTab === tab 
                                            ? 'bg-white text-accent border border-b-0 border-border shadow-[0_-4px_10px_rgba(0,0,0,0.02)]' 
                                            : 'border border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'
                                        }`}
                                >
                            {tab === 'Summary' ? <span className="flex items-center gap-2"><LayoutList size={14}/> Summary</span> : tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-8 overflow-y-auto bg-white flex-1 custom-modal-scrollbar">
                    {activeTab === 'Summary' ? (
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-gray-900 mb-4">Total Changes Overview</h4>
                            <div className="space-y-3">
                                {tables.map(table => {
                                    const d = diffs[table];
                                    const hasChanges = d.additions > 0 || d.deletions > 0 || d.modifications > 0;
                                    return (
                                        <div key={table} className={`p-4 rounded-xl border ${hasChanges ? 'border-accent/30 bg-accent/5' : 'border-border bg-gray-50'} flex justify-between items-center`}>
                                            <span className="font-semibold text-gray-800">{table}</span>
                                            <div className="flex gap-4 text-sm font-medium">
                                                <span className="text-green-600">+{d.additions} Additions</span>
                                                <span className="text-blue-600">~{d.modifications} Changes</span>
                                                <span className="text-red-600">-{d.deletions} Deletions</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-bold text-gray-900">{activeTab} Details</h4>
                                <div className="text-sm font-medium text-gray-500">
                                    Backup: {diffs[activeTab].totalBackup} / Live: {diffs[activeTab].totalLive}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-center">
                                    <div className="text-2xl font-black text-green-600">{diffs[activeTab].additions}</div>
                                    <div className="text-xs font-bold uppercase text-green-700 mt-1">Records to Add</div>
                                </div>
                                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-center">
                                    <div className="text-2xl font-black text-blue-600">{diffs[activeTab].modifications}</div>
                                    <div className="text-xs font-bold uppercase text-blue-700 mt-1">Records to Overwrite</div>
                                </div>
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
                                    <div className="text-2xl font-black text-red-600">{diffs[activeTab].deletions}</div>
                                    <div className="text-xs font-bold uppercase text-red-700 mt-1">Records to Delete</div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 text-center">
                                * Detailed row-by-row comparisons are computed securely on the backend.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-border bg-gray-50 flex justify-end shrink-0">
                    <Button 
                        onClick={() => setRestoreState('password')}
                        className="flex items-center gap-2 font-bold px-6"
                    >
                        Looks Good, Proceed <ChevronRight size={16} />
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <>
            <Card className="bg-white border-border shadow-sm overflow-hidden mt-6">
                <CardHeader className="border-b border-border pb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                            <Database size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">System Backup & Restore</h2>
                    </div>
                </CardHeader>
                <CardBody className="py-6 space-y-6">
                    <p className="text-sm text-gray-500">
                        Create a full backup of your business data, or safely analyze and restore from a previous backup file.
                    </p>

                    {message && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 animate-in zoom-in-95 duration-200 ${
                            message.type === 'success' ? 'bg-success-bg text-success border border-success-border' : 'bg-destructive-bg text-destructive border border-destructive-border'
                        }`}>
                            {message.type === 'success' ? <Check size={18} /> : <X size={18} />}
                            <span className="text-sm font-medium">{message.text}</span>
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        <Button 
                            variant="secondary" 
                            className="w-full flex items-center justify-center gap-2 h-12 font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                            onClick={() => { setExportPassword(''); setIsExportModalOpen(true); }}
                        >
                            <Download size={18} />
                            Download Full Backup
                        </Button>
                        
                        <Button 
                            variant="danger" 
                            className="w-full flex items-center justify-center gap-2 h-12 font-bold"
                            onClick={() => { resetRestoreModal(); setIsRestoreModalOpen(true); }}
                        >
                            <Upload size={18} />
                            Restore from Backup
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* EXPORT MODAL */}
            <AnimatePresence>
                {isExportModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => !isExporting && setIsExportModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col"
                        >
                            <div className="p-6 pb-0 flex items-start gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl shrink-0">
                                    <Download size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Download Backup</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Enter your Admin Restore Password to download a full copy of the database.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleExport} className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Admin Restore Password</label>
                                    <Input 
                                        type="password" 
                                        placeholder="••••••••" 
                                        value={exportPassword}
                                        onChange={(e) => setExportPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                
                                <div className="pt-4 flex gap-3">
                                    <Button 
                                        type="button" 
                                        variant="secondary" 
                                        className="flex-1"
                                        onClick={() => setIsExportModalOpen(false)}
                                        disabled={isExporting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        variant="primary" 
                                        className="flex-1"
                                        disabled={isExporting || !exportPassword}
                                    >
                                        {isExporting ? <Loader2 className="animate-spin" size={18} /> : 'Download'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* WIZARD RESTORE MODAL */}
            <AnimatePresence>
                {isRestoreModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => restoreState !== 'restoring' && restoreState !== 'loading' && setIsRestoreModalOpen(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* WIZARD HEADER */}
                            <div className="p-6 border-b border-border flex items-center gap-4 shrink-0 bg-white">
                                <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Database Restore Wizard</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {restoreState === 'select' && 'Select a valid JSON backup file.'}
                                        {restoreState === 'loading' && 'Analyzing backup file and comparing with live database...'}
                                        {restoreState === 'diff' && 'Review exactly what will change before proceeding.'}
                                        {restoreState === 'password' && 'Final confirmation: OVERWRITE database.'}
                                        {restoreState === 'restoring' && 'Restoring database in progress...'}
                                    </p>
                                </div>
                            </div>

                            {/* WIZARD BODY */}
                            <div className="relative bg-gray-50 flex-1 overflow-hidden">
                                
                                {/* STATE: SELECT FILE */}
                                {restoreState === 'select' && (
                                    <div className="p-12 flex flex-col items-center justify-center text-center">
                                        <input 
                                            type="file" 
                                            accept=".json" 
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full max-w-sm border-2 border-dashed border-accent/50 bg-accent/5 hover:bg-accent/10 transition-colors rounded-2xl p-8 cursor-pointer flex flex-col items-center gap-4 group"
                                        >
                                            <div className="p-4 bg-white rounded-full shadow-sm text-accent group-hover:scale-110 transition-transform">
                                                <FileJson size={32} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-accent">Browse File</h4>
                                                <p className="text-sm text-accent/70 mt-1">Click to select backup .json</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STATE: LOADING */}
                                {restoreState === 'loading' && (
                                    <div className="p-16 flex flex-col items-center justify-center text-center gap-4">
                                        <Loader2 className="animate-spin text-accent" size={48} />
                                        <h4 className="text-lg font-bold text-gray-700 animate-pulse">Computing Data Differences...</h4>
                                        <p className="text-sm text-gray-500 max-w-sm">Please wait while we compare the backup file against the live database securely.</p>
                                    </div>
                                )}

                                {/* STATE: DIFF VIEWER */}
                                {restoreState === 'diff' && renderDiffTabs()}

                                {/* STATE: PASSWORD */}
                                {restoreState === 'password' && (
                                    <form onSubmit={executeRestore} className="p-8 space-y-6 bg-white">
                                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                                            <AlertTriangle size={20} className="text-red-600 mt-0.5 shrink-0" />
                                            <div>
                                                <h5 className="font-bold text-red-900">Irreversible Action</h5>
                                                <p className="text-sm text-red-700 mt-1">Continuing will overwrite the live database completely. All current connections will be reset.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Admin Restore Password</label>
                                            <Input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                value={restorePassword}
                                                onChange={(e) => setRestorePassword(e.target.value)}
                                                autoFocus
                                                required
                                            />
                                        </div>
                                        
                                        <div className="pt-4 flex gap-3">
                                            <Button 
                                                type="button" 
                                                variant="secondary" 
                                                className="flex-1"
                                                onClick={() => setRestoreState('diff')}
                                            >
                                                Back to Changes
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                variant="danger" 
                                                className="flex-1"
                                                disabled={!restorePassword}
                                            >
                                                Confirm Overwrite
                                            </Button>
                                        </div>
                                    </form>
                                )}

                                {/* STATE: RESTORING */}
                                {restoreState === 'restoring' && (
                                    <div className="p-16 flex flex-col items-center justify-center text-center gap-4 bg-white">
                                        <Loader2 className="animate-spin text-red-600" size={48} />
                                        <h4 className="text-lg font-bold text-gray-900">Restoring Database...</h4>
                                        <p className="text-sm text-gray-500 max-w-sm">Executing child-to-parent deletion sequence and parent-to-child insertion sequence.</p>
                                    </div>
                                )}

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
