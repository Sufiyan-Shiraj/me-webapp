import { LayoutDashboard, Package, ShoppingCart, Settings, PieChart } from 'lucide-react';

export const navItems = [
    { 
        name: 'Dashboard', 
        mobileName: 'Home',
        href: '/dashboard', 
        icon: LayoutDashboard 
    },
    { 
        name: 'Inventory', 
        mobileName: 'Items',
        href: '/inventory', 
        icon: Package 
    },
    { 
        name: 'Sales', 
        href: '/sales', 
        icon: ShoppingCart 
    },
    { 
        name: 'Analytics', 
        href: '/analytics', 
        icon: PieChart 
    },
    { 
        name: 'Settings', 
        href: '/settings', 
        icon: Settings 
    },
];
