'use server'

import { createClient } from '@supabase/supabase-js';

// Create a server-side admin client to bypass RLS for dashboard stats
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function getDashboardStats() {
    try {
        // 1. Get Sales Count (Total unique sale_ids) and Total Units Sold
        const { data: sales, error: salesError } = await supabaseAdmin
            .from('me_sales')
            .select('sale_id, me_sale_items(quantity)');
        
        if (salesError) {
            console.error('Error fetching sales:', salesError);
        }

        const uniqueSales = sales ? new Set(sales.map(s => s.sale_id)).size : 0;
        const totalUnitsSold = sales ? sales.reduce((sum, s) => {
            const items = s.me_sale_items as any[] || [];
            return sum + items.reduce((itemSum, item) => itemSum + Number(item.quantity), 0);
        }, 0) : 0;

        // 1.5 Get Order Count (Pending Orders only)
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from('me_orders')
            .select('order_id')
            .gt('pending', 0);
        
        if (ordersError) {
            console.error('Error fetching orders:', ordersError);
        }

        const uniqueOrders = orders ? new Set(orders.map(o => o.order_id)).size : 0;

        // 2. Get Active Customers Count
        const { data: customers, error: customerError, count: customerCount } = await supabaseAdmin
            .from('customers')
            .select('*', { count: 'exact' })
            .eq('is_archived', false);
        
        if (customerError) {
            console.error('Error fetching customers:', customerError);
        }

        const finalCustomerCount = customerCount ?? (customers?.length || 0);

        // 3. Get Inventory Status with Item Names
        const { data: inventory, error: inventoryError } = await supabaseAdmin
            .from('me_item_types')
            .select(`
                id,
                name,
                quantity,
                me_items (
                    name,
                    is_archived
                )
            `)
            .eq('is_archived', false);
        
        if (inventoryError) throw inventoryError;

        // Filter out variants where the parent item is archived
        const activeInventory = (inventory || []).filter(item => {
            const parentItem = item.me_items as any;
            return parentItem && !parentItem.is_archived;
        });

        const totalItems = activeInventory.length;
        const totalQuantity = activeInventory.reduce((sum, item) => sum + Number(item.quantity), 0);
        const lowStockItems = activeInventory.filter(item => item.quantity <= 10);
        const lowStockCount = lowStockItems.filter(item => item.quantity > 0).length;
        const outOfStockCount = activeInventory.filter(item => item.quantity <= 0).length;

        return {
            salesCount: uniqueSales,
            orderCount: uniqueOrders,
            customerCount: finalCustomerCount,
            totalUnitsSold,
            inventory: {
                totalItems,
                totalQuantity,
                lowStockCount,
                outOfStockCount,
                inStockCount: totalItems - outOfStockCount,
                lowStockItems: lowStockItems.slice(0, 5).map(item => ({
                    id: item.id,
                    name: `${(item.me_items as any)?.name} - ${item.name}`,
                    stock: item.quantity,
                    threshold: 10 // Hardcoded threshold for now
                }))
            }
        };

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            salesCount: 0,
            orderCount: 0,
            customerCount: 0,
            inventory: {
                totalItems: 0,
                totalQuantity: 0,
                lowStockCount: 0,
                outOfStockCount: 0,
                inStockCount: 0,
                lowStockItems: []
            }
        };
    }
}
