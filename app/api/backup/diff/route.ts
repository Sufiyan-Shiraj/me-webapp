import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { jwtVerify } from 'jose';

export async function POST(request: Request) {
    try {
        // 1. Authenticate Request
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const secret = process.env.SUPABASE_JWT_SECRET;
        if (!secret) throw new Error('Missing SUPABASE_JWT_SECRET');

        try {
            await jwtVerify(token, new TextEncoder().encode(secret));
        } catch (err) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        const { backupData } = await request.json();
        if (!backupData) {
            return NextResponse.json({ error: 'No backup data provided' }, { status: 400 });
        }

        const tables = [
            'customers',
            'me_places',
            'me_item_types',
            'me_items',
            'me_orders',
            'me_sales',
            'me_sale_items'
        ];

        const diffs: Record<string, { additions: number, deletions: number, modifications: number, totalBackup: number, totalLive: number }> = {};

        for (const table of tables) {
            const { data: currentData, error } = await supabaseAdmin.from(table).select('*');
            if (error) {
                // If table doesn't exist, maybe it's just empty
                if (error.message.includes('does not exist')) {
                    diffs[table] = { additions: backupData[table]?.length || 0, deletions: 0, modifications: 0, totalBackup: backupData[table]?.length || 0, totalLive: 0 };
                    continue;
                }
                throw new Error(`Failed to fetch live table: ${table}`);
            }

            const liveArray = currentData || [];
            const backupArray = backupData[table] || [];

            const liveMap = new Map(liveArray.map(item => [item.id, item]));
            const backupMap = new Map(backupArray.map((item: any) => [item.id, item]));

            let additions = 0;
            let modifications = 0;
            let deletions = 0;

            // Check Additions & Modifications (in Backup, maybe not in Live)
            for (const [id, backupItem] of Array.from(backupMap.entries())) {
                const liveItem = liveMap.get(id);
                if (!liveItem) {
                    additions++;
                } else {
                    // Normalize dates or ignore updated_at if they jitter?
                    // Simple deep comparison via JSON stringify is fastest, but key order matters
                    // Better to compare keys
                    let isModified = false;
                    for (const key of Object.keys(backupItem)) {
                        if (JSON.stringify(backupItem[key]) !== JSON.stringify(liveItem[key])) {
                            isModified = true;
                            break;
                        }
                    }
                    if (isModified) {
                        modifications++;
                    }
                }
            }

            // Check Deletions (in Live, not in Backup)
            for (const id of Array.from(liveMap.keys())) {
                if (!backupMap.has(id)) {
                    deletions++;
                }
            }

            diffs[table] = {
                additions,
                deletions,
                modifications,
                totalBackup: backupArray.length,
                totalLive: liveArray.length
            };
        }

        return NextResponse.json({ success: true, diffs });

    } catch (error: any) {
        console.error('Diff Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
