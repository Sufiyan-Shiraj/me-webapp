'use server'

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

function toTitleCase(str: string) {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function getPlaces() {
    try {
        const { data, error } = await supabaseAdmin
            .from('me_places')
            .select('*')
            .order('name', { ascending: true });

        if (error) throw error;

        return { success: true, data };
    } catch (error: any) {
        console.error('Error fetching places:', error);
        return { success: false, error: error.message || 'Failed to fetch places' };
    }
}

export async function createPlace(name: string) {
    try {
        const titleCasedName = toTitleCase(name.trim());
        const { data, error } = await supabaseAdmin
            .from('me_places')
            .insert({ name: titleCasedName })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error: any) {
        // If it's a unique constraint violation, we can just return success false but maybe they can just fetch again
        console.error('Error creating place:', error);
        return { success: false, error: error.message || 'Failed to create place' };
    }
}
