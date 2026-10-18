'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Quote,
  Link2,
  Undo2,
  Redo2,
  Eye,
  MessageSquare,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
  onAddComment?: () => void;
}

export function EditorToolbar({
  editor,
  readOnly = false,
  onAddComment,
}: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  if (readOnly || !editor.isEditable) {
    return (
      <div className="flex items-center gap-2 p-2 px-3 bg-neutral-100 border border-neutral-200 rounded-md text-xs text-neutral-600 mb-4">
        <Eye className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
        <span>You have view-only access to this document. Editing and formatting are disabled.</span>
      </div>
    );
  }

  const setLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL (e.g. https://example.com)', previousUrl || 'https://');

    if (url === null) {
      return;
    }

    if (url.trim() === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const buttonClass = (isActive: boolean, disabled: boolean = false) =>
    `p-1.5 rounded transition-colors text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-neutral-900 ${
      disabled
        ? 'opacity-30 cursor-not-allowed text-neutral-400'
        : isActive
        ? 'bg-neutral-200 text-neutral-900 font-semibold'
        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
    }`;

  const divider = <div className="w-px h-5 bg-neutral-200 mx-1 self-center" />;

  return (
    <div
      role="toolbar"
      aria-label="Formatting options"
      className="flex flex-wrap items-center gap-0.5 p-1.5 bg-white border border-neutral-200 rounded-md shadow-xs mb-4"
    >
      {/* Undo / Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={buttonClass(false, !editor.can().undo())}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={buttonClass(false, !editor.can().redo())}
        title="Redo (Ctrl+Y)"
        aria-label="Redo"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      {divider}

      {/* Headings */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 1 }))}
        title="Heading 1"
        aria-label="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
        aria-label="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 3 }))}
        title="Heading 3"
        aria-label="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      {divider}

      {/* Formatting Marks */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
        title="Bold (Ctrl+B)"
        aria-label="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
        title="Italic (Ctrl+I)"
        aria-label="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>

      {divider}

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive('bulletList'))}
        title="Bullet List"
        aria-label="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive('orderedList'))}
        title="Numbered List"
        aria-label="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      {divider}

      {/* Code Block & Quote */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={buttonClass(editor.isActive('codeBlock'))}
        title="Code Block"
        aria-label="Code Block"
      >
        <Code className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive('blockquote'))}
        title="Blockquote"
        aria-label="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>

      {divider}

      {/* Link */}
      <button
        type="button"
        onClick={setLink}
        className={buttonClass(editor.isActive('link'))}
        title="Link"
        aria-label="Insert or edit link"
      >
        <Link2 className="w-4 h-4" />
      </button>

      {/* Comment */}
      {onAddComment && (
        <>
          {divider}
          <button
            type="button"
            onClick={onAddComment}
            className={buttonClass(false)}
            title="Add Comment on Selection"
            aria-label="Add Comment"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}
