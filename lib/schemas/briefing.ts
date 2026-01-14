import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(3, "A pergunta deve ter pelo menos 3 caracteres."),
  type: z.enum(["text", "paragraph", "select", "multiselect"]),
  options: z.array(z.string()).optional(), // For select/multiselect
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
});

export const templateSchema = z.object({
  name: z.string().min(3, "O nome do template deve ter pelo menos 3 caracteres."),
  description: z.string().optional(),
  icon: z.string().optional(),
  active: z.boolean().default(true),
  questions: z.array(questionSchema).optional(),
});

export type Question = z.infer<typeof questionSchema>;
export type BriefingTemplate = z.infer<typeof templateSchema> & {
    id?: string;
    created_at?: string;
    questions_count?: number; 
};
