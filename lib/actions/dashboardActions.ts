'use server'

import { createClient } from '@supabase/supabase-js';

// Create a server-side admin client to bypass RLS for dashboard stats
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function getDashboardStats() {
    try {
        // Run all queries concurrently using Promise.all
        const [
            salesRes,
            ordersRes,
            customersRes,
            inventoryRes
        ] = await Promise.all([
            // 1. Get Sales Count and Items for Units Sold
            supabaseAdmin
                .from('me_sales')
                .select('sale_id, me_sale_items(quantity)'),
            
            // 1.5 Get Order Count (Pending Orders only)
            supabaseAdmin
                .from('me_orders')
                .select('order_id')
                .gt('pending', 0),
                
            // 2. Get Active Customers Count
            supabaseAdmin
                .from('customers')
                .select('*', { count: 'exact', head: true })
                .eq('is_archived', false),
                
            // 3. Get Inventory Status with Item Names
            supabaseAdmin
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
                .eq('is_archived', false)
        ]);

        if (salesRes.error) console.error('Error fetching sales:', salesRes.error);
        if (ordersRes.error) console.error('Error fetching orders:', ordersRes.error);
        if (customersRes.error) console.error('Error fetching customers:', customersRes.error);
        if (inventoryRes.error) console.error('Error fetching inventory:', inventoryRes.error);

        // Process Sales & Units Sold
        const sales = salesRes.data || [];
        const uniqueSales = new Set(sales.map(s => s.sale_id)).size;
        const totalUnitsSold = sales.reduce((sum, s) => {
            const items = s.me_sale_items as any[] || [];
            return sum + items.reduce((itemSum, item) => itemSum + Number(item.quantity), 0);
        }, 0);

        // Process Orders Count
        const orders = ordersRes.data || [];
        const uniqueOrders = new Set(orders.map(o => o.order_id)).size;

        // Process Customers Count
        const finalCustomerCount = customersRes.count || 0;

        // Process Inventory
        const inventory = inventoryRes.data || [];
        // Filter out variants where the parent item is archived
        const activeInventory = inventory.filter(item => {
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
            totalUnitsSold: 0,
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

export async function getPendingOrdersOverview() {
    try {
        const { data, error } = await supabaseAdmin
            .from('me_orders')
            .select(`
                pending,
                place,
                customers ( name, district ),
                me_item_types (
                    name,
                    me_items ( name )
                )
            `)
            .gt('pending', 0);

        if (error) throw error;

        const formatted = data.map((row: any) => {
            const customer = row.customers && !Array.isArray(row.customers) ? row.customers : { name: 'Unknown', district: 'Ernakulam' };
            const itemType = row.me_item_types && !Array.isArray(row.me_item_types) ? row.me_item_types : null;
            const baseItem = itemType?.me_items && !Array.isArray(itemType.me_items) ? itemType.me_items : { name: 'Unknown' };

            return {
                product_name: baseItem.name,
                variant: itemType?.name || 'Standard',
                pending: row.pending,
                customer_name: customer.name,
                place: row.place || customer.district || 'Ernakulam'
            };
        });

        return formatted;
    } catch (error) {
        console.error("Error fetching pending items server-side:", error);
        return [];
    }
}
