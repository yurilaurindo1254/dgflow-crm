"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Loader2, User as UserIcon, Shield } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export default function TeamPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchData() {
       const { data: { user } } = await supabase.auth.getUser();
       setCurrentUser(user);

       const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
       if (data) setProfiles(data);
       setLoading(false);
    }
    fetchData();
  }, []);

  const updateRole = async (userId: string, newRole: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
          alert('Erro ao atualizar permissão: ' + error.message);
      } else {
          setProfiles(profiles.map(p => p.id === userId ? { ...p, role: newRole } : p));
      }
  };

  const getRoleBadge = (role: string) => {
      switch(role) {
          case 'admin': return <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-bold border border-red-500/20">ADMIN</span>;
          case 'employee': return <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded text-xs font-bold border border-blue-500/20">EQUIPE</span>;
          case 'client': return <span className="bg-zinc-800 text-zinc-400 px-2 py-1 rounded text-xs font-bold border border-white/10">CLIENTE</span>;
          default: return null;
      }
  };

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-pink-500" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gerenciar Equipe</h1>
          <p className="text-zinc-400 mt-1">Controle quem tem acesso à organização.</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold text-white flex items-center gap-2">
                    <UserIcon size={18} /> Membros ({profiles.length})
                </h3>
            </div>
            
            <div className="divide-y divide-white/5">
                {profiles.map((profile) => (
                    <div key={profile.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                {profile.full_name?.charAt(0) || <UserIcon size={18}/>}
                            </div>
                            <div>
                                <p className="font-medium text-white">{profile.full_name || 'Usuário Sem Nome'}</p>
                                <p className="text-xs text-zinc-500 flex items-center gap-1">
                                    <Shield size={10} /> {profile.role}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                             {getRoleBadge(profile.role)}
                             
                             {/* Only allow editing if current user is not editing themselves (optional constraint) or just straightforward dropdown */}
                             <select
                                className="bg-zinc-950 border border-white/10 text-xs text-zinc-300 rounded px-2 py-1 focus:ring-1 focus:ring-pink-500"
                                value={profile.role}
                                onChange={(e) => updateRole(profile.id, e.target.value)}
                                disabled={profile.id === currentUser?.id} // Prevent locking oneself out mostly
                             >
                                 <option value="admin">Admin</option>
                                 <option value="employee">Funcionário</option>
                                 <option value="client">Cliente</option>
                             </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>

         <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-lg text-yellow-200/80 text-sm">
             <strong className="text-yellow-500 block mb-1">Nota sobre convites:</strong>
             Para adicionar novos membros, peça para eles se cadastrarem no link <code>/cadastro</code>.
             Eles entrarão automaticamente como <strong>Admin</strong> (por enquanto) e você poderá ajustar o cargo aqui.
             <br/>
              <em>(Recomendação: Ajuste o Trigger do banco de dados para &apos;employee&apos; como padrão se preferir segurança maior)</em>
         </div>

    </div>
  );
}
