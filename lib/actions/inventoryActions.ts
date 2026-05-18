'use server'

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Create a server-side admin client to bypass RLS for inventory management
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function deleteItem(itemId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('me_items')
            .update({ is_archived: true })
            .eq('id', itemId);

        if (error) throw error;

        // Cascade soft-delete to variants
        const { error: variantError } = await supabaseAdmin
            .from('me_item_types')
            .update({ is_archived: true })
            .eq('item_id', itemId);
        
        if (variantError) throw variantError;

        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error('Error deleting item:', error);
        return { success: false, error: 'Failed to delete item.' };
    }
}

export async function deleteItemType(typeId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('me_item_types')
            .update({ is_archived: true })
            .eq('id', typeId);

        if (error) throw error;

        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error('Error deleting item type:', error);
        return { success: false, error: 'Failed to delete variant.' };
    }
}

export async function saveInventory(data: { item: string; variants: { type: string; quantity: number; unit: string }[] }) {
    try {
        // 1. Ensure the base item exists
        let itemId: string;
        
        const { data: existingItem, error: fetchError } = await supabaseAdmin
            .from('me_items')
            .select('id')
            .eq('name', data.item.trim())
            .single();
        
        if (existingItem) {
            itemId = existingItem.id;
        } else {
            const { data: newItem, error: createError } = await supabaseAdmin
                .from('me_items')
                .insert({ name: data.item.trim() })
                .select()
                .single();
            
            if (createError) throw createError;
            itemId = newItem.id;
        }

        // 2. Process variants
        for (const v of data.variants) {
            const { data: existingType } = await supabaseAdmin
                .from('me_item_types')
                .select('id, quantity')
                .eq('item_id', itemId)
                .eq('name', v.type.trim())
                .single();
            
            if (existingType) {
                // Update existing variant (Add to quantity)
                const { error: updateError } = await supabaseAdmin
                    .from('me_item_types')
                    .update({ 
                        quantity: existingType.quantity + v.quantity,
                        unit: v.unit 
                    })
                    .eq('id', existingType.id);
                
                if (updateError) throw updateError;
            } else {
                // Create new variant
                const { error: insertError } = await supabaseAdmin
                    .from('me_item_types')
                    .insert({
                        item_id: itemId,
                        name: v.type.trim(),
                        quantity: v.quantity,
                        unit: v.unit
                    });
                
                if (insertError) throw insertError;
            }
        }

        revalidatePath('/inventory');
        return { success: true };
    } catch (error: any) {
        console.error('Error saving inventory:', error);
        return { success: false, error: error.message || 'Failed to save inventory' };
    }
}

export async function updateInventoryQuantities(updates: { id: string; quantity: number; unit: string }[]) {
    try {
        for (const u of updates) {
            const { error } = await supabaseAdmin
                .from('me_item_types')
                .update({ 
                    quantity: u.quantity,
                    unit: u.unit 
                })
                .eq('id', u.id);
            
            if (error) throw error;
        }

        revalidatePath('/inventory');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating quantities:', error);
        return { success: false, error: error.message || 'Failed to update quantities' };
    }
}
