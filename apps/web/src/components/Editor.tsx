'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { EditorToolbar } from './EditorToolbar';

interface EditorProps {
  initialContent?: string;
  onUpdate?: (content: string) => void;
  editable?: boolean;
}

export function Editor({
  initialContent = '<p>Start typing your document notes or report here...</p>',
  onUpdate,
  editable = true,
}: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-neutral-900 underline underline-offset-2 hover:text-neutral-600',
        },
      }),
    ],
    content: initialContent,
    editable,
    immediatelyRender: false, // Prevents SSR hydration mismatch in Next.js App Router
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[500px] w-full p-8 bg-white border border-neutral-200 rounded-md focus:outline-hidden prose prose-neutral max-w-none text-neutral-900 leading-relaxed font-sans shadow-xs',
      },
    },
  });

  return (
    <div className="w-full">
      <EditorToolbar editor={editor} />
      <div className="editor-paper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
