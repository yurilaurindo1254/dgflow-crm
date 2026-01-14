"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  async function onSubmit(data: LoginFormValues) {
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        throw authError;
      }

      router.push("/"); // Redirect to dashboard
      router.refresh();
      
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message === "Invalid details."  
        ? "E-mail ou senha incorretos." 
        : "Ocorreu um erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative z-10 shadow-2xl">
        
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta!</h1>
            <p className="text-zinc-400 text-sm">Acesse sua conta para continuar.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-2">
            <Label className="text-zinc-300 text-xs uppercase font-bold tracking-wide">E-mail</Label>
            <Input 
              {...register("email")}
              placeholder="seu@email.com" 
              className="bg-zinc-900 border-white/10 h-12 text-white placeholder:text-zinc-600 focus:border-primary-500/50 transition-all font-medium"
            />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className="text-zinc-300 text-xs uppercase font-bold tracking-wide">Senha</Label>
                <Link href="#" className="text-xs text-primary-500 hover:text-primary-600 transition-colors">Esqueceu a senha?</Link>
            </div>
            <Input 
              type="password"
              {...register("password")}
              placeholder="••••••••" 
              className="bg-zinc-900 border-white/10 h-12 text-white placeholder:text-zinc-600 focus:border-primary-500/50 transition-all font-medium"
            />
            {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-linear-to-r from-primary-500 to-emerald-600 hover:opacity-90 text-black font-bold rounded-xl mt-2 transition-all shadow-lg shadow-primary-500/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : <div className="flex items-center gap-2">Entrar <ArrowRight size={16} /></div>}
          </Button>

        </form>

        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-zinc-500 text-sm">
            Não tem uma conta?{" "}
            <Link href="/cadastro" className="text-white hover:text-primary-500 font-bold transition-colors">
              Criar conta
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
