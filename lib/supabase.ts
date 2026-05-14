import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const customFetch = (url: RequestInfo | URL, options?: RequestInit) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('app_token') : null;
    if (token) {
        options = options || {};
        const headers = new Headers(options.headers);
        headers.set('Authorization', `Bearer ${token}`);
        options.headers = headers;
    }
    return fetch(url, options);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: customFetch
    }
});
