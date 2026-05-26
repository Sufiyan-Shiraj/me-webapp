'use server'

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function getAnalyticsData(timeRange: string, type: 'sales' | 'orders' = 'sales') {
    try {
        let dateLimit = new Date();
        if (timeRange === '7d') dateLimit.setDate(dateLimit.getDate() - 7);
        else if (timeRange === '30d') dateLimit.setDate(dateLimit.getDate() - 30);
        else if (timeRange === '90d') dateLimit.setDate(dateLimit.getDate() - 90);
        else dateLimit = new Date(0); // all time

        const dateISO = dateLimit.toISOString();

        // Also get active customers
        const { count: customerCount, error: customerError } = await supabaseAdmin
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('is_archived', false);

        // Process data
        let totalUnits = 0;
        let totalRecords = 0;
        
        // 1. Trend Data (group by date)
        const trendMap = new Map<string, number>();
        // Initialize trendMap with 0s for the selected range to ensure all dates are present
        if (timeRange !== 'all') {
            const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
            for (let i = days - 1; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                trendMap.set(d.toISOString().split('T')[0], 0);
            }
        }
        
        // 2. Category Data
        const categoryMap = new Map<string, number>();
        
        // 3. Top Products Data
        const productMap = new Map<string, { category: string, quantity: number }>();

        if (type === 'sales') {
            // Get sales within time range
            const { data: sales, error: salesError } = await supabaseAdmin
                .from('me_sales')
                .select(`
                    id,
                    created_at,
                    customers ( id, name ),
                    me_sale_items (
                        quantity,
                        me_orders (
                            me_item_types (
                                name,
                                me_items ( name )
                            )
                        )
                    )
                `)
                .gte('created_at', dateISO)
                .order('created_at', { ascending: true });

            if (salesError) throw salesError;

            totalRecords = sales?.length || 0;

            sales?.forEach((sale: any) => {
                const date = new Date(sale.created_at).toISOString().split('T')[0];
                let dailyVolume = 0;

                sale.me_sale_items?.forEach((item: any) => {
                    const qty = Number(item.quantity);
                    totalUnits += qty;
                    dailyVolume += qty;

                    const order = item.me_orders && !Array.isArray(item.me_orders) ? item.me_orders : null;
                    const itemType = order?.me_item_types && !Array.isArray(order.me_item_types) ? order.me_item_types : null;
                    const baseItem = itemType?.me_items && !Array.isArray(itemType.me_items) ? itemType.me_items : null;

                    const category = itemType?.name || 'Standard';
                    const productName = baseItem?.name || 'Unknown Product';
                    const fullProductName = category !== 'Standard' ? `${productName} - ${category}` : productName;

                    // Category aggregate
                    categoryMap.set(category, (categoryMap.get(category) || 0) + qty);

                    // Product aggregate
                    if (!productMap.has(fullProductName)) {
                        productMap.set(fullProductName, { category: category, quantity: 0 });
                    }
                    productMap.get(fullProductName)!.quantity += qty;
                });

                // Trend aggregate
                trendMap.set(date, (trendMap.get(date) || 0) + dailyVolume);
            });
        } else {
            // Get orders within time range
            const { data: orders, error: ordersError } = await supabaseAdmin
                .from('me_orders')
                .select(`
                    id,
                    order_id,
                    created_at,
                    quantity,
                    me_item_types (
                        name,
                        me_items ( name )
                    )
                `)
                .gte('created_at', dateISO)
                .order('created_at', { ascending: true });

            if (ordersError) throw ordersError;

            const uniqueOrders = new Set(orders?.map(o => o.order_id));
            totalRecords = uniqueOrders.size;

            orders?.forEach((order: any) => {
                const date = new Date(order.created_at).toISOString().split('T')[0];
                const qty = Number(order.quantity);
                totalUnits += qty;

                const itemType = order.me_item_types && !Array.isArray(order.me_item_types) ? order.me_item_types : null;
                const baseItem = itemType?.me_items && !Array.isArray(itemType.me_items) ? itemType.me_items : null;

                const category = itemType?.name || 'Standard';
                const productName = baseItem?.name || 'Unknown Product';
                const fullProductName = category !== 'Standard' ? `${productName} - ${category}` : productName;

                // Category aggregate
                categoryMap.set(category, (categoryMap.get(category) || 0) + qty);

                // Product aggregate
                if (!productMap.has(fullProductName)) {
                    productMap.set(fullProductName, { category: category, quantity: 0 });
                }
                productMap.get(fullProductName)!.quantity += qty;

                // Trend aggregate
                trendMap.set(date, (trendMap.get(date) || 0) + qty);
            });
        }

        // Format Trend Data
        const trendData = Array.from(trendMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([date, value]) => {
                const dateObj = new Date(date);
                const label = timeRange === '7d' ? dateObj.toLocaleDateString('en-US', { weekday: 'short' }) :
                              dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                return { label, date, value, color: type === 'sales' ? '#06B6D4' : '#8B5CF6' };
            });

        // Format Category Data
        const colors = type === 'sales'
            ? ['#06B6D4', '#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280']
            : ['#8B5CF6', '#D946EF', '#EC4899', '#F43F5E', '#14B8A6', '#0EA5E9', '#6B7280'];
        
        let rawCategoryData = Array.from(categoryMap.entries())
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value); // Sort by highest

        const totalCategoryVolume = rawCategoryData.reduce((acc, curr) => acc + curr.value, 0);
        const significantCategories: { label: string, value: number }[] = [];
        let othersValue = 0;

        rawCategoryData.forEach(item => {
            const percentage = totalCategoryVolume > 0 ? (item.value / totalCategoryVolume) * 100 : 0;
            if (percentage >= 1) {
                significantCategories.push(item);
            } else {
                othersValue += item.value;
            }
        });

        if (othersValue > 0) {
            significantCategories.push({ label: 'Other', value: othersValue });
        }
        
        rawCategoryData = significantCategories;

        const categoryData = rawCategoryData.map((item, i) => ({
            ...item,
            color: colors[i % colors.length]
        }));

        // Format Top Products
        const topProducts = Array.from(productMap.entries())
            .map(([name, data]) => ({
                name,
                category: data.category,
                quantity: data.quantity
            }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10); // top 10

        return {
            success: true,
            kpis: [
                { label: type === 'sales' ? 'Total Units Sold' : 'Total Units Ordered', value: totalUnits.toLocaleString(), trend: 'up', change: 'Current period' },
                { label: type === 'sales' ? 'Total Shipments' : 'Total Orders', value: totalRecords.toLocaleString(), trend: 'up', change: 'Current period' },
                { label: 'Active Customers', value: customerCount?.toLocaleString() || '0', trend: 'up', change: 'Total' },
            ],
            trendData,
            categoryData,
            topProducts
        };

    } catch (error: any) {
        console.error('Error fetching analytics data:', error);
        return { success: false, error: error.message };
    }
}
