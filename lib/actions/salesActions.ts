'use server'

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function updateSaleItem(itemId: string, updates: { pending?: number; done?: boolean }) {
    try {
        const { error } = await supabaseAdmin
            .from('me_sales')
            .update({
                pending: updates.pending,
                done: updates.done,
                done_time: updates.done ? new Date().toISOString() : null
            })
            .eq('id', itemId);

        if (error) throw error;

        revalidatePath('/sales');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating sale item:', error);
        return { success: false, error: error.message || 'Failed to update sale' };
    }
}

export async function createSale(insertPayload: any[]) {
    try {
        const { error } = await supabaseAdmin
            .from('me_sales')
            .insert(insertPayload);

        if (error) throw error;

        revalidatePath('/sales');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error creating sale:', error);
        return { success: false, error: error.message || 'Failed to create sale' };
    }
}
