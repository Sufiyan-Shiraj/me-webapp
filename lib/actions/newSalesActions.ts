'use server'

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function createSale(saleId: number, customerId: string, items: { order_item_id: string; quantity: number; current_pending: number }[]) {
    try {
        // 1. Create the sale record
        const { data: saleData, error: saleError } = await supabaseAdmin
            .from('me_sales')
            .insert({
                sale_id: saleId,
                customer_id: customerId
            })
            .select()
            .single();

        if (saleError) throw saleError;

        // 2. Insert sale items
        const saleItemsPayload = items.map(item => ({
            sale_id: saleData.id,
            order_item_id: item.order_item_id,
            quantity: item.quantity
        }));

        const { error: saleItemsError } = await supabaseAdmin
            .from('me_sale_items')
            .insert(saleItemsPayload);

        if (saleItemsError) throw saleItemsError;

        // 3. Update pending quantities in me_orders
        for (const item of items) {
            const newPending = Math.max(0, item.current_pending - item.quantity);
            const { error: orderError } = await supabaseAdmin
                .from('me_orders')
                .update({ pending: newPending, done: newPending === 0, done_time: newPending === 0 ? new Date().toISOString() : null })
                .eq('id', item.order_item_id);

            if (orderError) throw orderError;
        }

        revalidatePath('/sales');
        revalidatePath('/orders');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error creating sale shipment:', error);
        return { success: false, error: error.message || 'Failed to create shipment' };
    }
}

export async function deleteSaleShipment(saleId: number) {
    // This could also restore pending quantities, but depending on requirements,
    // a simple cascade delete might be enough or we can add logic to restore.
    try {
        // Find the sale items to restore pending first
        const { data: saleData } = await supabaseAdmin
            .from('me_sales')
            .select('id')
            .eq('sale_id', saleId)
            .single();

        if (saleData) {
            const { data: saleItems } = await supabaseAdmin
                .from('me_sale_items')
                .select('order_item_id, quantity')
                .eq('sale_id', saleData.id);

            if (saleItems) {
                for (const item of saleItems) {
                    // Fetch current pending
                    const { data: orderItem } = await supabaseAdmin
                        .from('me_orders')
                        .select('pending')
                        .eq('id', item.order_item_id)
                        .single();

                    if (orderItem) {
                        const newPending = orderItem.pending + item.quantity;
                        await supabaseAdmin
                            .from('me_orders')
                            .update({ pending: newPending, done: false, done_time: null })
                            .eq('id', item.order_item_id);
                    }
                }
            }
        }

        // Now delete the sale (cascades to items)
        const { error } = await supabaseAdmin
            .from('me_sales')
            .delete()
            .eq('sale_id', saleId);

        if (error) throw error;

        revalidatePath('/sales');
        revalidatePath('/orders');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting sale shipment:', error);
        return { success: false, error: error.message || 'Failed to delete shipment' };
    }
}

export async function updateSaleShipment(saleId: number, items: { id: string; order_item_id: string; quantity: number; original_quantity: number }[]) {
    try {
        const { data: saleData } = await supabaseAdmin
            .from('me_sales')
            .select('id')
            .eq('sale_id', saleId)
            .single();

        if (!saleData) throw new Error("Sale not found");

        for (const item of items) {
            const diff = item.original_quantity - item.quantity;
            
            if (item.quantity === 0) {
                // Remove item from shipment
                const { error: delError } = await supabaseAdmin.from('me_sale_items').delete().eq('id', item.id);
                if (delError) throw delError;
            } else if (diff !== 0) {
                // Update shipment quantity
                const { error: updateError } = await supabaseAdmin.from('me_sale_items').update({ quantity: item.quantity }).eq('id', item.id);
                if (updateError) throw updateError;
            }

            // Restore/deduct pending amount
            if (diff !== 0 && item.order_item_id !== 'unknown') {
                const { data: orderItem } = await supabaseAdmin.from('me_orders').select('pending').eq('id', item.order_item_id).single();
                if (orderItem) {
                    const newPending = Math.max(0, orderItem.pending + diff);
                    await supabaseAdmin.from('me_orders').update({ pending: newPending, done: newPending === 0, done_time: newPending === 0 ? new Date().toISOString() : null }).eq('id', item.order_item_id);
                }
            }
        }

        // If no items remain, delete the sale
        const { count } = await supabaseAdmin.from('me_sale_items').select('*', { count: 'exact', head: true }).eq('sale_id', saleData.id);
        if (count === 0) {
            await supabaseAdmin.from('me_sales').delete().eq('id', saleData.id);
        }

        revalidatePath('/sales');
        revalidatePath('/orders');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating sale shipment:', error);
        return { success: false, error: error.message || 'Failed to update shipment' };
    }
}
