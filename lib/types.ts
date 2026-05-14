export type Role = 'admin' | 'staff';

export interface User {
    id: string;
    username: string;
    name: string;
    role: Role;
    avatar_url?: string;
    me?: boolean;
    mayfield?: boolean;
}

export interface InventoryItem {
    id: string; // uuid
    item_id: number; // bigint
    item: string; // name
    type: string | null; // variant
    unit?: string;
    quantity: number; // bigint
}

export type ItemStatus = 'waiting' | 'completed' | 'pending';
export type SaleStatus = 'waiting' | 'completed' | 'pending' | 'cancelled';

export interface Customer {
    id: string;
    name: string;
}

export interface Item {
    id: string;
    name: string;
}

export interface ItemType {
    id: string;
    item_id: string;
    name: string;
    unit?: string;
    quantity: number;
}

export interface InvoiceItem {
    id: string; // The me_sales row id
    item_type_id: string;
    product_name: string; // Joined from me_items
    variant: string; // Joined from me_item_types
    quantity: number;
    pending: number;
    done: boolean;
    done_time?: string;
}

export interface SaleInvoice {
    sale_id: number;
    date: string;
    customer_id: string;
    customer_name: string;
    items: InvoiceItem[];
    status?: SaleStatus;
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
