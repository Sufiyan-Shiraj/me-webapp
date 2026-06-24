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

export async function unarchiveItem(itemId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('me_items')
            .update({ is_archived: false })
            .eq('id', itemId);

        if (error) throw error;

        // Cascade restore to variants
        const { error: variantError } = await supabaseAdmin
            .from('me_item_types')
            .update({ is_archived: false })
            .eq('item_id', itemId);
        
        if (variantError) throw variantError;

        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error('Error unarchiving item:', error);
        return { success: false, error: 'Failed to restore product.' };
    }
}

export async function unarchiveItemType(typeId: string) {
    try {
        // Get parent item ID first
        const { data: variant, error: getError } = await supabaseAdmin
            .from('me_item_types')
            .select('item_id')
            .eq('id', typeId)
            .single();
        if (getError) throw getError;

        // Unarchive the variant itself
        const { error } = await supabaseAdmin
            .from('me_item_types')
            .update({ is_archived: false })
            .eq('id', typeId);
        if (error) throw error;

        // Unarchive parent item as well to ensure visibility
        if (variant?.item_id) {
            const { error: parentError } = await supabaseAdmin
                .from('me_items')
                .update({ is_archived: false })
                .eq('id', variant.item_id);
            if (parentError) throw parentError;
        }

        revalidatePath('/inventory');
        return { success: true };
    } catch (error) {
        console.error('Error unarchiving item type:', error);
        return { success: false, error: 'Failed to restore variant.' };
    }
}

export async function saveInventory(data: { 
    id?: string; 
    item: string; 
    variants: { id?: string; type: string; quantity: number; unit: string }[] 
}) {
    try {
        // 1. Ensure the base item exists and is updated
        let itemId: string;
        
        if (data.id) {
            // Update existing item name
            const { error: updateError } = await supabaseAdmin
                .from('me_items')
                .update({ name: data.item.trim() })
                .eq('id', data.id);
            if (updateError) throw updateError;
            itemId = data.id;
        } else {
            const { data: existingItem } = await supabaseAdmin
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
        }

        // 2. Process variants
        for (const v of data.variants) {
            if (v.id) {
                // If variant has ID, rename and set quantity/unit directly by ID
                const { error: updateError } = await supabaseAdmin
                    .from('me_item_types')
                    .update({ 
                        name: v.type.trim(),
                        quantity: v.quantity,
                        unit: v.unit 
                    })
                    .eq('id', v.id);
                
                if (updateError) throw updateError;
            } else {
                // Search for existing by name or insert new
                const { data: existingType } = await supabaseAdmin
                    .from('me_item_types')
                    .select('id')
                    .eq('item_id', itemId)
                    .eq('name', v.type.trim())
                    .single();
                
                if (existingType) {
                    const { error: updateError } = await supabaseAdmin
                        .from('me_item_types')
                        .update({ 
                            quantity: v.quantity,
                            unit: v.unit 
                        })
                        .eq('id', existingType.id);
                    if (updateError) throw updateError;
                } else {
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

export async function hardDeleteItem(itemId: string) {
    try {
        // 1. Get all variant IDs for this item
        const { data: variants, error: fetchError } = await supabaseAdmin
            .from('me_item_types')
            .select('id')
            .eq('item_id', itemId);
            
        if (fetchError) throw fetchError;
        
        const variantIds = variants?.map(v => v.id) || [];
        
        if (variantIds.length > 0) {
            // 2. Check if any variant has sales history
            const { count, error: countError } = await supabaseAdmin
                .from('me_sales')
                .select('*', { count: 'exact', head: true })
                .in('item_type_id', variantIds);
                
            if (countError) throw countError;
            
            if (count && count > 0) {
                return { success: false, error: 'Cannot delete: This product has variants with associated sales history.' };
            }
            
            // 3. Delete all variants first
            const { error: deleteVariantsError } = await supabaseAdmin
                .from('me_item_types')
                .delete()
                .eq('item_id', itemId);
                
            if (deleteVariantsError) throw deleteVariantsError;
        }
        
        // 4. Delete the parent item
        const { error: deleteItemError } = await supabaseAdmin
            .from('me_items')
            .delete()
            .eq('id', itemId);
            
        if (deleteItemError) throw deleteItemError;
        
        revalidatePath('/inventory');
        return { success: true };
    } catch (error: any) {
        console.error('Error hard deleting item:', error);
        return { success: false, error: error.message || 'Failed to permanently delete product' };
    }
}

export async function hardDeleteItemType(typeId: string) {
    try {
        // Check if there are any sales associated with this item type
        const { count, error: countError } = await supabaseAdmin
            .from('me_sales')
            .select('*', { count: 'exact', head: true })
            .eq('item_type_id', typeId);
            
        if (countError) throw countError;
        
        if (count && count > 0) {
            return { success: false, error: 'Cannot delete: This variant has associated sales history.' };
        }
        
        const { error } = await supabaseAdmin
            .from('me_item_types')
            .delete()
            .eq('id', typeId);
            
        if (error) throw error;
        
        revalidatePath('/inventory');
        return { success: true };
    } catch (error: any) {
        console.error('Error hard deleting variant:', error);
        return { success: false, error: error.message || 'Failed to permanently delete variant' };
    }
}

export async function renameItem(itemId: string, newName: string) {
    try {
        const { error } = await supabaseAdmin
            .from('me_items')
            .update({ name: newName.trim() })
            .eq('id', itemId);

        if (error) throw error;

        revalidatePath('/inventory');
        return { success: true };
    } catch (error: any) {
        console.error('Error renaming item:', error);
        return { success: false, error: error.message || 'Failed to rename product.' };
    }
}

export async function migrateVariant(variantId: string, targetItemId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('me_item_types')
            .update({ item_id: targetItemId })
            .eq('id', variantId);

        if (error) throw error;

        revalidatePath('/inventory');
        return { success: true };
    } catch (error: any) {
        console.error('Error migrating variant:', error);
        return { success: false, error: error.message || 'Failed to migrate variant.' };
    }
}

