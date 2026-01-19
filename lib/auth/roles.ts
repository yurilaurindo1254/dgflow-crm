import { supabase } from "@/lib/supabase";

export type Role = 'admin' | 'project_manager' | 'designer' | 'editor' | 'client';

export const PERMISSIONS = {
  admin: ['*'],
  project_manager: [
    '/projetos', 
    '/tarefas', 
    '/equipe', 
    '/clientes', 
    '/briefings',
    '/brand-center',
    '/roteiros',
    '/capacidade'
  ],
  designer: ['/tarefas', '/agenda', '/briefings', '/brand-center', '/roteiros'],
  editor: ['/tarefas', '/agenda', '/briefings', '/brand-center', '/roteiros'],
  client: ['/portal'] // Assuming client has limited access
};

export async function getUserRole(userId: string): Promise<Role | null> {
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
    
    return profile?.role as Role || null;
}

export function checkPermission(role: Role, path: string): boolean {
  if (role === 'admin') return true;
  
  const allowedPaths = PERMISSIONS[role] || [];
  
  // Check exact match or if path starts with allowed path (e.g. /tarefas/123)
  return allowedPaths.some(p => 
    path === p || path.startsWith(`${p}/`)
  );
}

export async function isUserAdmin(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const role = await getUserRole(user.id);
    return role === 'admin';
}
