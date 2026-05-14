'use server'

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function deleteItem(itemId: string) {
    try {
        const { error } = await supabase
            .from('me_items')
            .delete()
            .eq('id', itemId);

        if (error) {
            if (error.code === '23503') {
                return { success: false, error: 'Cannot delete item because it has associated sales records.' };
            }
            throw error;
        }

        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error('Error deleting item:', error);
        return { success: false, error: 'Failed to delete item.' };
    }
}

export async function deleteItemType(typeId: string) {
    try {
        const { error } = await supabase
            .from('me_item_types')
            .delete()
            .eq('id', typeId);

        if (error) {
            if (error.code === '23503') {
                return { success: false, error: 'Cannot delete this type because it has associated sales records.' };
            }
            throw error;
        }

        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error('Error deleting item type:', error);
        return { success: false, error: 'Failed to delete variant.' };
    }
}
