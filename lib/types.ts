export type Role = 'admin' | 'manager' | 'staff';

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    avatar_url?: string;
}

export interface InventoryItem {
    id: string;
    sku: string;
    name: string;
    category: string;
    quantity: number;
    unit_price: number;
    min_stock_level: number;
    supplier?: string;
    location?: string;
    description?: string;
    last_updated: string;
}

export type SaleStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export interface InvoiceItem {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total: number;
}

export interface SaleInvoice {
    id: string;
    invoice_number: string;
    date: string;
    customer_name: string;
    customer_email?: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: SaleStatus;
}

export interface LoginActivity {
    id: string;
    user_id: string;
    timestamp: string;
    ip_address: string;
    location: string;
    device: string;
    browser: string;
    status: 'success' | 'failed';
    is_suspicious: boolean;
}
