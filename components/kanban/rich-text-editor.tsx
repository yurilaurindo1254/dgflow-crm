"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';


interface Props {
  content: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  editable?: boolean;
}

export function RichTextEditor({ content, onChange, onBlur, editable = true }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Adicione uma descrição detalhada...',
      }),
    ],
    immediatelyRender: false,
    content: content,
    editable: editable,
    editorProps: {
      attributes: {
        class: "prose prose-invert prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2 text-foreground",
      },

    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: () => {
      onBlur?.();
    }
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-border bg-muted/10 overflow-hidden focus-within:border-primary/50 transition-all">
      {editable && (
        <div className="flex items-center gap-1 p-1 border-b border-border bg-muted/20">

          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={<Bold size={14} />}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={<Italic size={14} />}
          />
          <div className="w-px h-4 bg-border mx-1" />

          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={<List size={14} />}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={<ListOrdered size={14} />}
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={<Quote size={14} />}
          />
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({ onClick, isActive, icon }: { onClick: () => void, isActive: boolean, icon: React.ReactNode }) {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className={cn(
                "h-7 w-7 p-0 rounded hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground",
                isActive && "bg-white/10 text-foreground shadow-inner"
            )}
            type="button"
        >
            {icon}
        </Button>
    )

}
