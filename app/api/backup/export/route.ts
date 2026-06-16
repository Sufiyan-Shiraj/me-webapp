// Force Turbopack recompile
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        // Verify Admin Password
        if (!password || password !== process.env.ADMIN_RESTORE_PASSWORD) {
            return NextResponse.json({ error: 'Invalid admin password' }, { status: 401 });
        }

        // Fetch all tables
        const tables = [
            'customers',
            'me_places',
            'me_item_types',
            'me_items',
            'me_orders',
            'me_sales',
            'me_sale_items'
        ];

        const backupData: Record<string, any[]> = {};

        for (const table of tables) {
            const { data, error } = await supabaseAdmin.from(table).select('*');
            if (error) {
                console.error(`Error fetching table ${table}:`, error);
                throw new Error(`Failed to backup table: ${table}`);
            }
            backupData[table] = data || [];
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup_${timestamp}.json`;

        return NextResponse.json({
            success: true,
            filename,
            data: backupData
        });

    } catch (error: any) {
        console.error('Backup Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
