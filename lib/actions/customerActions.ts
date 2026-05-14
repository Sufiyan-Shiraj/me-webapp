'use server'

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function createCustomer(name: string) {
    try {
        const { data, error } = await supabaseAdmin
            .from('customers')
            .insert({ name: name.trim() })
            .select()
            .single();

        if (error) throw error;

        revalidatePath('/sales'); // Because Sales uses customers
        return { success: true, data };
    } catch (error: any) {
        console.error('Error creating customer:', error);
        return { success: false, error: error.message || 'Failed to create customer' };
    }
}
