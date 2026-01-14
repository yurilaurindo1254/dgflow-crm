"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ProfileChecker() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing-profile' | 'unauthenticated'>('loading');

  useEffect(() => {
    async function checkProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setStatus('unauthenticated');
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || !profile) {
        setStatus('missing-profile');
      } else {
        setStatus('ok');
      }
    }

    checkProfile();
  }, []);

  if (status === 'loading' || status === 'ok' || status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <Alert variant="destructive" className="bg-rose-500/10 border-rose-500/20 text-rose-500">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle className="font-bold uppercase tracking-tight">Perfil não encontrado</AlertTitle>
        <AlertDescription className="text-rose-400/80 mt-1">
          Detectamos que seu usuário não possui um perfil configurado. Isso pode impedir que você veja clientes, tarefas e outros dados devido às políticas de segurança.
          <div className="mt-4 flex gap-3">
             <Link href="/equipe">
               <Button variant="outline" className="h-8 border-rose-500/30 text-rose-500 hover:bg-rose-500/20 hover:text-rose-400 text-xs font-bold uppercase">
                 Ver Equipe / Configurar Perfil
               </Button>
             </Link>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
