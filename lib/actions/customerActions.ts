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

export async function getCustomers() {
    try {
        const { data, error } = await supabaseAdmin
            .from('customers')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        return { success: true, data };
    } catch (error: any) {
        console.error('Error fetching customers:', error);
        return { success: false, error: error.message || 'Failed to fetch customers' };
    }
}

export async function deleteCustomer(id: string) {
    try {
        const { error } = await supabaseAdmin
            .from('customers')
            .update({ is_archived: true })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/sales');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting customer:', error);
        return { success: false, error: error.message || 'Failed to delete customer' };
    }
}

export async function unarchiveCustomer(id: string) {
    try {
        const { error } = await supabaseAdmin
            .from('customers')
            .update({ is_archived: false })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/sales');
        return { success: true };
    } catch (error: any) {
        console.error('Error unarchiving customer:', error);
        return { success: false, error: error.message || 'Failed to restore customer' };
    }
}

export async function hardDeleteCustomer(id: string) {
    try {
        // Check if there are any sales associated with this customer
        const { count, error: countError } = await supabaseAdmin
            .from('me_sales')
            .select('*', { count: 'exact', head: true })
            .eq('customer_id', id);
        
        if (countError) throw countError;
        
        if (count && count > 0) {
            return { success: false, error: 'Cannot delete: This customer has associated sales history.' };
        }
        
        const { error } = await supabaseAdmin
            .from('customers')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        
        revalidatePath('/sales');
        return { success: true };
    } catch (error: any) {
        console.error('Error hard deleting customer:', error);
        return { success: false, error: error.message || 'Failed to permanently delete customer' };
    }
}
