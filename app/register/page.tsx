"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormValues } from "@/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  async function onSubmit(data: RegisterFormValues) {
    setLoading(true);
    setError(null);

    try {
      const { error: authError, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                full_name: data.name,
            }
        }
      });

      if (authError) {
        throw authError;
      }

      // Check if email confirmation is required
      if (authData.session) {
          router.push("/"); // Direct login
          router.refresh();
      } else {
          // You might show a "Check email" screen here
          alert("Cadastro realizado! Verifique seu e-mail para confirmar.");
          router.push("/login");
      }
      
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || "Ocorreu um erro ao criar a conta.");
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-primary-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-zinc-950/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative z-10 shadow-2xl">
        
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-500/10 text-primary-500 mb-4 border border-primary-500/20">
                <Sparkles size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Conta da Organização</h1>
            <p className="text-zinc-400 text-sm">Criar conta para Dono ou Funcionário.</p>
            <p className="text-zinc-500 text-xs mt-2">É um cliente? <Link href="/portal" className="underline hover:text-primary-500">Acesse o portal do cliente.</Link></p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-2">
            <Label className="text-zinc-300 text-xs uppercase font-bold tracking-wide">Nome Completo</Label>
            <Input 
              {...register("name")}
              placeholder="Seu nome" 
              className="bg-zinc-900 border-white/10 h-12 text-white placeholder:text-zinc-600 focus:border-pink-500/50 transition-all font-medium"
            />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300 text-xs uppercase font-bold tracking-wide">E-mail</Label>
            <Input 
              {...register("email")}
              placeholder="seu@email.com" 
              className="bg-zinc-900 border-white/10 h-12 text-white placeholder:text-zinc-600 focus:border-pink-500/50 transition-all font-medium"
            />
            {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label className="text-zinc-300 text-xs uppercase font-bold tracking-wide">Senha</Label>
                <Input 
                type="password"
                {...register("password")}
                placeholder="••••••••" 
                className="bg-zinc-900 border-white/10 h-12 text-white placeholder:text-zinc-600 focus:border-primary-500/50 transition-all font-medium"
                />
                {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
            </div>
             <div className="space-y-2">
                <Label className="text-zinc-300 text-xs uppercase font-bold tracking-wide">Confirmar</Label>
                <Input 
                type="password"
                {...register("confirmPassword")}
                placeholder="••••••••" 
                className="bg-zinc-900 border-white/10 h-12 text-white placeholder:text-zinc-600 focus:border-primary-500/50 transition-all font-medium"
                />
                {errors.confirmPassword && <span className="text-red-500 text-xs">{errors.confirmPassword.message}</span>}
            </div>
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
            {loading ? <Loader2 className="animate-spin" /> : "Criar Conta Gratuita"}
          </Button>

        </form>

        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-zinc-500 text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-white hover:text-primary-500 font-bold transition-colors">
              Fazer login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
