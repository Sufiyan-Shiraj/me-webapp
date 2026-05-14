'use server'

import { supabase } from '@/lib/supabase';

export async function getDashboardStats() {
    try {
        // 1. Get Sales Count (Total unique sale_ids)
        const { data: sales, error: salesError } = await supabase
            .from('me_sales')
            .select('sale_id');
        
        if (salesError) throw salesError;
        const uniqueSales = new Set(sales.map(s => s.sale_id)).size;

        // 2. Get Active Customers Count
        const { count: customerCount, error: customerError } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true });
        
        if (customerError) throw customerError;

        // 3. Get Inventory Status with Item Names
        const { data: inventory, error: inventoryError } = await supabase
            .from('me_item_types')
            .select(`
                id,
                name,
                quantity,
                me_items (
                    name
                )
            `);
        
        if (inventoryError) throw inventoryError;

        const totalItems = inventory.length;
        const totalQuantity = inventory.reduce((sum, item) => sum + Number(item.quantity), 0);
        const lowStockItems = inventory.filter(item => item.quantity <= 10);
        const lowStockCount = lowStockItems.filter(item => item.quantity > 0).length;
        const outOfStockCount = inventory.filter(item => item.quantity <= 0).length;

        return {
            salesCount: uniqueSales,
            customerCount: customerCount || 0,
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
