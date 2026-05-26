import { LayoutDashboard, Package, ShoppingCart, Truck, Users, ClipboardList } from 'lucide-react';

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
        name: 'Orders',
        href: '/orders',
        icon: ClipboardList
    },
    {
        name: 'Shipments',
        href: '/sales',
        icon: Truck
    },
    {
        name: 'Analytics',
        href: '/analytics',
        icon: ShoppingCart
    },
    {
        name: 'User Management',
        href: '/users',
        icon: Users
    },
];
