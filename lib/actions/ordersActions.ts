'use server'

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function updateOrderItem(itemId: string, updates: { pending?: number; done?: boolean; place?: string }) {
    try {
        const payload: any = {};
        if (updates.pending !== undefined) payload.pending = updates.pending;
        if (updates.done !== undefined) {
            payload.done = updates.done;
            payload.done_time = updates.done ? new Date().toISOString() : null;
        }
        if (updates.place !== undefined) payload.place = updates.place;

        const { error } = await supabaseAdmin
            .from('me_orders')
            .update(payload)
            .eq('id', itemId);

        if (error) throw error;

        revalidatePath('/orders');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating order item:', error);
        return { success: false, error: error.message || 'Failed to update order' };
    }
}

export async function createOrder(insertPayload: any[]) {
    try {
        const { error } = await supabaseAdmin
            .from('me_orders')
            .insert(insertPayload);

        if (error) throw error;

        revalidatePath('/orders');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error creating order:', error);
        return { success: false, error: error.message || 'Failed to create order' };
    }
}

export async function deleteOrder(orderId: number) {
    try {
        const { error } = await supabaseAdmin
            .from('me_orders')
            .delete()
            .eq('order_id', orderId);

        if (error) throw error;

        revalidatePath('/orders');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting order:', error);
        return { success: false, error: error.message || 'Failed to delete order' };
    }
}

export async function updateFullOrder(
    orderId: number, 
    customerId: string, 
    itemsToUpdate: any[], 
    itemsToAdd: any[], 
    itemsToDelete: string[]
) {
    try {
        // Update existing items
        for (const item of itemsToUpdate) {
            const { error } = await supabaseAdmin
                .from('me_orders')
                .update({
                    customer_id: customerId,
                    item_type_id: item.item_type_id,
                    quantity: item.quantity,
                    pending: item.pending,
                    place: item.place,
                    done: item.pending === 0
                })
                .eq('id', item.id);
            if (error) throw error;
        }

        // Add new items
        if (itemsToAdd.length > 0) {
            const payload = itemsToAdd.map(item => ({
                order_id: orderId,
                customer_id: customerId,
                item_type_id: item.item_type_id,
                quantity: item.quantity,
                pending: item.quantity,
                place: item.place,
                done: false
            }));
            const { error } = await supabaseAdmin.from('me_orders').insert(payload);
            if (error) throw error;
        }

        // Delete items
        if (itemsToDelete.length > 0) {
            const { error } = await supabaseAdmin
                .from('me_orders')
                .delete()
                .in('id', itemsToDelete);
            if (error) throw error;
        }

        revalidatePath('/orders');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating full order:', error);
        return { success: false, error: error.message || 'Failed to update order' };
    }
}
