import { ShieldCheck, MapPin, Monitor } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function SecurityBanner() {
    return (
        <Card className="bg-white border border-border shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4">
                <div className="flex gap-4">
                    <div className="p-2 bg-accent/10 rounded-xl border border-accent/20 shadow-sm">
                        <ShieldCheck className="text-accent" size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Security Check Passed</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <Monitor size={12} className="text-accent" /> Chrome on Windows
                            </span>
                            <span className="flex items-center gap-1.5 text-gray-600">
                                <MapPin size={12} className="text-accent" /> New York, USA
                            </span>
                            <span className="opacity-70">• Last active: Today, 10:30 AM</span>
                        </div>
                    </div>
                </div>
                <div className="hidden md:block">
                    <div className="px-2 py-1 rounded bg-success/10 border border-success/20 text-success text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        Secure
                    </div>
                </div>
            </div>
        </Card>
    );
}
