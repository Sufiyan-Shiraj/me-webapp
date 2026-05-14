'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Role } from '@/lib/types';
import { revalidatePath } from 'next/cache'

export async function createNewUser(formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as Role;
    const meAccess = formData.get('me') === 'on';
    const mayfieldAccess = formData.get('mayfield') === 'on';

    try {
        if (!username || !password || !role) {
            throw new Error('Username, Password, and Role are required.');
        }

        // Explicit case-insensitive check for username uniqueness
        const { data: existingUsers } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .ilike('username', username.trim());

        if (existingUsers && existingUsers.length > 0) {
            throw new Error('This username is already taken. Please choose another one.');
        }

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                username: username,
                password: password,
                role: role,
                me: meAccess,
                mayfield: mayfieldAccess
            });

        if (profileError) {
             if (profileError.code === '23505') {
                 throw new Error('Username already exists.');
             }
             throw profileError;
        }

        revalidatePath('/users')
        return { success: true, message: `User ${username} created successfully.` };

    } catch (error: any) {
        console.error('Error creating user:', error);
        return { success: false, message: error.message };
    }
}

export async function getAllUsers() {
    try {
        const { data: profiles, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, users: profiles };
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return { success: false, message: error.message };
    }
}

export async function updateUserPassword(userId: string, currentPass: string, newPass: string) {
    try {
        if (!userId) throw new Error('Unauthorized');
        if (!currentPass || !newPass) throw new Error('All fields are required');

        // Verify current password
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('password')
            .eq('id', userId)
            .single();

        if (fetchError || !profile) throw new Error('User account not found');
        if (profile.password !== currentPass) {
            throw new Error('Current password is incorrect');
        }

        // Update password
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ 
                password: newPass,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (updateError) throw updateError;

        return { success: true, message: 'Password updated successfully.' };
    } catch (error: any) {
        console.error('Password update error:', error);
        return { success: false, message: error.message };
    }
}

export async function adminUpdateUser(userId: string, data: { role: Role, me: boolean, mayfield: boolean }) {
    try {
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({
                role: data.role,
                me: data.me,
                mayfield: data.mayfield,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
        revalidatePath('/users');
        return { success: true, message: 'User updated successfully.' };
    } catch (error: any) {
        console.error('Error updating user:', error);
        return { success: false, message: error.message };
    }
}

export async function adminChangePassword(userId: string, newPass: string) {
    try {
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({
                password: newPass,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) throw error;
        return { success: true, message: 'Password updated successfully.' };
    } catch (error: any) {
        console.error('Error updating password:', error);
        return { success: false, message: error.message };
    }
}

export async function deleteUser(userId: string) {
    try {
        const { error } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) throw error;
        revalidatePath('/users');
        return { success: true, message: 'User deleted successfully.' };
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return { success: false, message: error.message };
    }
}
