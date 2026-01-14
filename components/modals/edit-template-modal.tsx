"use client";

import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod"; // Import z
import { templateSchema, BriefingTemplate } from "@/lib/schemas/briefing";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Save, LayoutTemplate, Type, List, CheckSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useModal } from "@/contexts/modal-context";
import { cn } from "@/lib/utils";

interface EditTemplateModalProps {
    initialData?: Partial<BriefingTemplate>;
}

export function EditTemplateModal({ initialData }: EditTemplateModalProps) {
  const { closeModal } = useModal();
  const [activeTab, setActiveTab] = useState("questions");
  const [loading, setLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);

  // Use the schema inference for form values, as BriefingTemplate includes extra DB fields not in the form
  type TemplateFormValues = z.infer<typeof templateSchema>;

  const form = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
        active: initialData?.active ?? true,
        questions: initialData?.questions || [],
        name: initialData?.name || "",
        description: initialData?.description || "",
        icon: initialData?.icon || ""
    } as TemplateFormValues
  });

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  // Watch questions to update count in tabs
  const questionsList = watch("questions");

  async function onSubmit(data: TemplateFormValues) {
    setLoading(true);
    // TODO: Implement Database Save
    console.log("Saving Template:", data);

    try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
            alert("Usuário não autenticado");
            return;
        }

        // 1. Insert/Update Template
        const { data: template, error: templateError } = await supabase.from('briefing_templates').insert({
            name: data.name,
            description: data.description,
            icon: data.icon,
            category: 'custom',
            is_custom: true,
            active: data.active,
            questions_count: data.questions?.length || 0,
            user_id: user.data.user.id
        }).select().single();
        
        if (templateError) throw templateError;

        // 2. Insert Questions
        if (data.questions && data.questions.length > 0) {
            const questionsToInsert = data.questions.map((q, idx) => ({
                template_id: template.id,
                text: q.text,
                type: q.type,
                options: q.options || [],
                required: q.required,
                placeholder: q.placeholder,
                order_index: idx
            }));
            
            const { error: questionsError } = await supabase.from('briefing_questions').insert(questionsToInsert);
            if (questionsError) throw questionsError;
        }

        closeModal();
        window.location.reload(); // Refresh to show new template
    } catch (error) {
        console.error("Error saving template:", error);
        alert("Erro ao salvar template. Tente novamente.");
    } finally {
        setLoading(false);
    }
  }

  const toggleExpand = (index: number) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  const addQuestion = (type: string = "text") => {
      append({
          text: "",
          type: type as "text" | "paragraph" | "select" | "multiselect",
          required: false,
          options: []
      });
      setExpandedQuestion(fields.length); // Open the new question
  };

  const SUGGESTED_QUESTIONS = [
      { text: "Qual é o seu nome completo?", type: "text" },
      { text: "Qual é o seu e-mail?", type: "text" },
      { text: "Qual é o seu Instagram?", type: "text" },
      { text: "Qual é o nome da sua empresa?", type: "text" },
      { text: "Qual é o prazo desejado?", type: "text" },
  ];

  return (
    <Modal title="Editar Template de Briefing" className="max-w-4xl h-[90vh] flex flex-col">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          
          {/* Header Tabs */}
          <div className="flex items-center gap-2 mb-6 bg-zinc-900 p-1 rounded-lg shrink-0">
             <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                    activeTab === "settings" ? "bg-zinc-800 text-white border border-primary-500/30" : "text-zinc-500 hover:text-white"
                )}
             >
                 Configurações
             </button>
             <button
                type="button"
                onClick={() => setActiveTab("questions")}
                className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                    activeTab === "questions" ? "bg-zinc-800 text-white border border-primary-500/30" : "text-zinc-500 hover:text-white"
                )}
             >
                 Perguntas ({questionsList?.length || 0})
             </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            
            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200 h-full overflow-y-auto custom-scrollbar p-1 pb-20">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome do Template *</Label>
                            <Input {...register("name")} placeholder="Ex: Landing Page" className="bg-zinc-950 border-white/10" />
                            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                        </div>
                        <div className="space-y-2">
                            <Label>Ícone</Label>
                            <div className="flex gap-2">
                                <div className="h-10 w-10 flex items-center justify-center bg-zinc-900 rounded border border-white/10 text-primary-500">
                                    <LayoutTemplate size={20} />
                                </div>
                                <Input {...register("icon")} placeholder="Ícone (opcional)" className="bg-zinc-900 border-white/10 flex-1" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Descrição (opcional)</Label>
                        <textarea 
                            {...register("description")} 
                            placeholder="Descreva o objetivo deste briefing..."
                            className="w-full bg-zinc-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary-500/50 min-h-[100px] resize-none text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                        <Switch 
                            checked={watch("active")} 
                            onCheckedChange={(val) => setValue("active", val)} 
                        />
                        <Label>Template Ativo</Label> 
                    </div>
                </div>
            )}

            {/* QUESTIONS TAB */}
            {activeTab === "questions" && (
                <div className="h-full flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto custom-scrollbar p-1 pb-20">
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={field.id} className="bg-zinc-900/50 border border-white/5 rounded-xl overflow-hidden transition-all">
                                
                                {/* Question Header (Collapsed) */}
                                <div 
                                    className={cn(
                                        "p-4 flex items-center gap-3 cursor-pointer hover:bg-zinc-900 transition-colors",
                                        expandedQuestion === index && "bg-zinc-900 border-b border-white/5"
                                    )}
                                    onClick={() => toggleExpand(index)}
                                >
                                    <div className="cursor-grab hover:text-white text-zinc-600" onClick={(e) => e.stopPropagation()}>
                                        <GripVertical size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn("text-sm font-medium", !questionsList?.[index]?.text && "text-zinc-500 italic")}>
                                            {questionsList?.[index]?.text || "Nova Pergunta"}
                                        </p>
                                        <span className="text-[10px] uppercase font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded ml-2">
                                            {questionsList?.[index]?.required ? "Obrigatória" : "Opcional"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); remove(index); }}
                                            className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded text-zinc-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        {expandedQuestion === index ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                                    </div>
                                </div>

                                {/* Question Body (Expanded) */}
                                {expandedQuestion === index && (
                                    <div className="p-4 space-y-4 bg-zinc-950/30">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-zinc-500 uppercase">Sua Pergunta</Label>
                                            <Input 
                                                {...register(`questions.${index}.text`)} 
                                                placeholder="Ex: Qual o objetivo do projeto?" 
                                                className="bg-zinc-900 border-white/10"
                                            />
                                            {errors.questions?.[index]?.text && <span className="text-red-500 text-xs">{errors.questions[index]?.text?.message}</span>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-zinc-500 uppercase">Tipo de Resposta</Label>
                                                <div className="relative">
                                                    <select 
                                                        {...register(`questions.${index}.type`)}
                                                        className="w-full h-10 bg-zinc-900 border border-white/10 rounded-md px-3 pl-9 text-sm text-white focus:outline-none focus:border-primary-500/50 appearance-none"
                                                    >
                                                        <option value="text">Texto Curto</option>
                                                        <option value="paragraph">Parágrafo</option>
                                                        <option value="select">Seleção Única</option>
                                                        <option value="multiselect">Múltipla Escolha</option>
                                                    </select>
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                                                        {questionsList?.[index]?.type === 'text' && <Type size={14} />}
                                                        {questionsList?.[index]?.type === 'paragraph' && <List size={14} />}
                                                        {questionsList?.[index]?.type === 'select' && <CheckSquare size={14} />}
                                                        {questionsList?.[index]?.type === 'multiselect' && <CheckSquare size={14} />}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                 <Label className="text-xs font-bold text-zinc-500 uppercase">Placeholder (Opcional)</Label>
                                                 <Input {...register(`questions.${index}.placeholder`)} placeholder="Dica para o cliente..." className="bg-zinc-900 border-white/10" />
                                            </div>
                                        </div>

                                        {(questionsList?.[index]?.type === 'select' || questionsList?.[index]?.type === 'multiselect') && (
                                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                <Label className="text-xs font-bold text-zinc-500 uppercase">Opções (uma por linha)</Label>
                                                <textarea 
                                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary-500/50 min-h-[80px] text-sm"
                                                    placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                                                    onChange={(e) => {
                                                        const lines = e.target.value.split('\n').filter(l => l.trim() !== '');
                                                        // Use setValue properly to update array options
                                                         setValue(`questions.${index}.options`, lines);
                                                    }}
                                                    defaultValue={questionsList?.[index]?.options?.join('\n')}
                                                />
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center gap-2 pt-2">
                                            <Switch 
                                                checked={watch(`questions.${index}.required`)} 
                                                onCheckedChange={(val) => setValue(`questions.${index}.required`, val)} 
                                            />
                                            <Label className="text-sm">Pergunta obrigatória</Label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Suggestions */}
                    <div className="border-t border-white/10 pt-6">
                        <Label className="text-zinc-500 mb-3 block text-xs uppercase font-bold tracking-wide">Sugestões de perguntas</Label>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTED_QUESTIONS.map((sug, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                        append({ text: sug.text, type: sug.type as "text" | "paragraph" | "select" | "multiselect", required: true, options: [] });
                                        setExpandedQuestion(fields.length); // fields.length will be the new index
                                    }}
                                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 rounded-full px-3 py-1.5 text-xs flex items-center gap-1 transition-all"
                                >
                                    <Plus size={12} />
                                    {sug.text}
                                </button>
                            ))}
                        </div>
                    </div>
                     <button
                        type="button"
                        onClick={() => addQuestion()} 
                        className="w-full py-4 border border-dashed border-white/10 rounded-xl text-zinc-500 hover:text-white hover:border-primary-500/50 hover:bg-zinc-900/50 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                        <Plus size={16} />
                        Adicionar Pergunta em Branco
                    </button>
                    <div className="h-12" /> {/* Spacer */}
                </div>
            )}

            {/* Sticky Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-zinc-950/80 backdrop-blur-xl border-t border-white/10 flex justify-end gap-3 z-10">
                <Button type="button" variant="ghost" onClick={() => closeModal()}>Cancelar</Button>
                <Button type="submit" disabled={loading} className="bg-primary-500 hover:bg-primary-600 text-black gap-2 font-bold">
                    <Save size={16} />
                    Salvar Template
                </Button>
            </div>

          </div>
      </form>
    </Modal>
  );
}
