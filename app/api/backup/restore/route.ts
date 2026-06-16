// Force Turbopack recompile
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const DELETE_ORDER = [
    'me_sale_items',
    'me_sales',
    'me_orders',
    'me_item_types',
    'me_items',
    'me_places',
    'customers'
];

const INSERT_ORDER = [
    'customers',
    'me_places',
    'me_items',
    'me_item_types',
    'me_orders',
    'me_sales',
    'me_sale_items'
];

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password, backupData } = body;

        // 1. Verify Admin Password
        if (!password || password !== process.env.ADMIN_RESTORE_PASSWORD) {
            return NextResponse.json({ error: 'Invalid restore password' }, { status: 401 });
        }

        console.log('Starting Database Restore...');

        // 2. Delete existing data (Child -> Parent)
        for (const table of DELETE_ORDER) {
            const { error } = await supabaseAdmin.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (error) {
                console.error(`Error clearing table ${table}:`, error);
                if (!error.message.includes("does not exist")) {
                    throw new Error(`Failed to clear table: ${table}. ${error.message}`);
                }
            }
        }

        // 3. Insert new data (Parent -> Child)
        for (const table of INSERT_ORDER) {
            const tableData = backupData[table];
            if (tableData && tableData.length > 0) {
                const chunkSize = 500;
                for (let i = 0; i < tableData.length; i += chunkSize) {
                    const chunk = tableData.slice(i, i + chunkSize);
                    const { error } = await supabaseAdmin.from(table).insert(chunk);
                    if (error) {
                        console.error(`Error inserting into ${table}:`, error);
                        throw new Error(`Failed to restore table: ${table}. ${error.message}`);
                    }
                }
            }
        }

        console.log('Database Restore Completed successfully!');
        return NextResponse.json({ success: true, message: 'Database restored successfully' });

    } catch (error: any) {
        console.error('Restore Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
