import { supabase } from "@/lib/supabase";

export type Role = 'admin' | 'employee' | 'client';

export async function getUserRole(userId: string): Promise<Role | null> {
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
    
    return profile?.role as Role || null;
}

export async function isUserAdmin(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const role = await getUserRole(user.id);
    return role === 'admin';
}
