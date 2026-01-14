import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Digite um e-mail válido."),
  password: z.string().min(1, "Digite sua senha."),
});

export const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Digite um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  confirmPassword: z.string().min(6, "Confirme sua senha."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
