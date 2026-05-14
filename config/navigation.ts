import { LayoutDashboard, Package, ShoppingCart, PieChart, Users } from 'lucide-react';

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
        name: 'User Management',
        href: '/users',
        icon: Users
    },
];
