'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function getRecentActivity() {
    try {
        const { data: logs, error } = await supabaseAdmin
            .from('login_activity')
            .select(`
                *,
                profiles (
                    username
                )
            `)
            .order('timestamp', { ascending: false })
            .limit(20);

        if (error) throw error;

        return logs.map((log: any) => ({
            id: log.id,
            user: log.profiles?.username || 'Unknown',
            action: log.status === 'success' ? 'Login Success' : 'Login Failed',
            details: `${log.device || 'Unknown'} • ${log.browser ? log.browser.split(' ')[0] : 'Unknown'}`,
            timestamp: log.timestamp,
            type: 'auth',
            status: log.status,
            ip_address: log.ip_address,
            location: log.location,
            device: log.device,
            is_suspicious: log.is_suspicious
        }));

    } catch (error) {
        console.error('Error fetching login activity:', error);
        return [];
    }
}
