'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Collaboration from '@tiptap/extension-collaboration';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { EditorToolbar } from './EditorToolbar';
import { CollaborationCursor } from './CollaborationCursorExtension';
import { CommentMark } from './CommentMarkExtension';
import { useAuth } from '../context/AuthContext';
import { getDeterministicColor, getInitials } from '../utils/presence';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface CollaborativeEditorProps {
  documentId: string;
  wsToken: string;
  role?: 'owner' | 'editor' | 'viewer';
  activeCommentId?: string | null;
  onSelectComment?: (commentId: string | null) => void;
  onAddCommentRequest?: (commentId: string) => void;
}

interface Collaborator {
  clientId: number;
  name: string;
  color: string;
  isCurrentUser: boolean;
}

interface EditorCoreProps {
  provider: HocuspocusProvider;
  documentId: string;
  role: 'owner' | 'editor' | 'viewer';
  status: 'connecting' | 'connected' | 'disconnected';
  activeCommentId: string | null;
  onSelectComment?: (commentId: string | null) => void;
  onAddCommentRequest?: (commentId: string) => void;
  currentUser: { name: string; color: string };
  isSimulatedOffline: boolean;
  onToggleOffline: () => void;
}

function EditorCore({
  provider,
  documentId,
  role,
  status,
  activeCommentId,
  onSelectComment,
  onAddCommentRequest,
  currentUser,
  isSimulatedOffline,
  onToggleOffline,
}: EditorCoreProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const onSelectCommentRef = useRef(onSelectComment);

  useEffect(() => {
    onSelectCommentRef.current = onSelectComment;
  }, [onSelectComment]);

  // Synchronize presence awareness and track active collaborators
  useEffect(() => {
    if (!provider || !provider.awareness) return;

    const awareness = provider.awareness;

    // Set local awareness state
    awareness.setLocalStateField('user', currentUser);

    const updateCollaborators = () => {
      const states = awareness.getStates();
      const currentClientId = awareness.clientID;
      const list: Collaborator[] = [];

      states.forEach((state: any, clientId: number) => {
        if (state && state.user && state.user.name) {
          list.push({
            clientId,
            name: state.user.name,
            color: state.user.color || '#2563eb',
            isCurrentUser: clientId === currentClientId,
          });
        }
      });

      setCollaborators(list);
    };

    updateCollaborators();
    awareness.on('change', updateCollaborators);

    return () => {
      awareness.off('change', updateCollaborators);
    };
  }, [provider, currentUser]);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          undoRedo: false, // Yjs handles distributed undo/redo history in collaborative mode
          link: false, // Avoid duplicate extension name warning with Link below
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Collaboration.configure({
          document: provider.document,
        }),
        CollaborationCursor.configure({
          provider,
          user: currentUser,
        }),
        CommentMark,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-stone-900 underline underline-offset-2 hover:text-stone-600',
          },
        }),
      ],
      editable: role !== 'viewer',
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            'min-h-[500px] w-full p-8 bg-white border border-stone-200 rounded-md focus:outline-hidden prose prose-stone max-w-none text-stone-900 leading-relaxed font-sans shadow-xs',
        },
        handleClick: (_view, _pos, event) => {
          const target = event.target as HTMLElement | null;
          const commentEl = target?.closest('.kagaz-comment-highlight');
          if (commentEl) {
            const commentId = commentEl.getAttribute('data-comment-id');
            if (commentId && onSelectCommentRef.current) {
              onSelectCommentRef.current(commentId);
              return true;
            }
          }
          return false;
        },
      },
    },
    [provider]
  );

  // Synchronize TipTap editable status if role changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(role !== 'viewer');
    }
  }, [editor, role]);

  // Synchronize active comment styling in DOM
  useEffect(() => {
    if (!editor) return;
    const marks = document.querySelectorAll('.kagaz-comment-highlight');
    marks.forEach((el) => {
      if (activeCommentId && el.getAttribute('data-comment-id') === activeCommentId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });
  }, [activeCommentId, editor]);

  // Handler for creating an inline comment mark on current selection
  const handleAddComment = () => {
    if (!editor || role === 'viewer') return;
    const { empty } = editor.state.selection;
    if (empty) {
      alert('Please select some text before adding a comment.');
      return;
    }
    const commentId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    editor.chain().focus().setComment({ commentId }).run();
    if (onAddCommentRequest) {
      onAddCommentRequest(commentId);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Collaboration Connection & Presence Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 bg-white border border-stone-200 rounded-md shadow-xs text-xs">
        <div className="flex items-center gap-3">
          {status === 'connected' ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
          ) : status === 'connecting' ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
              Connecting to room...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium text-stone-700 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
              <span className="w-2 h-2 rounded-full bg-stone-400"></span>
              Offline (Local Mode)
            </span>
          )}

          {/* Active Collaborators Presence Bar */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {collaborators.map((c) => (
                <div
                  key={c.clientId}
                  style={{ backgroundColor: c.color }}
                  className="relative inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-semibold text-white ring-2 ring-white shadow-xs select-none transition-transform hover:scale-110 hover:z-10 cursor-default"
                  title={c.isCurrentUser ? `${c.name} (You)` : c.name}
                >
                  {getInitials(c.name)}
                </div>
              ))}
            </div>

            <span className="text-stone-500 text-[11px] font-medium hidden sm:inline">
              {collaborators.length} {collaborators.length === 1 ? 'collaborator' : 'collaborators'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-500 hidden md:inline">
            Room: <code className="font-mono text-stone-800">{documentId.substring(0, 8)}...</code>
          </span>

          <button
            type="button"
            onClick={onToggleOffline}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-stone-900 ${
              isSimulatedOffline
                ? 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
            }`}
            title="Toggle offline mode to test CRDT merge upon reconnect"
          >
            {isSimulatedOffline ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span>Reconnect</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Simulate Offline</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Toolbar */}
      <EditorToolbar
        editor={editor}
        readOnly={role === 'viewer'}
        onAddComment={role !== 'viewer' ? handleAddComment : undefined}
      />

      {/* Editor Content Area */}
      <div className="editor-paper">
        <EditorContent editor={editor} />
      </div>

      {/* Editor Document Footer Metrics */}
      <div className="flex items-center justify-between px-3.5 py-2 text-[11px] text-stone-500 bg-white border border-stone-200 rounded-md shadow-xs">
        <div className="flex items-center gap-3">
          <span>{editor?.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0} words</span>
          <span className="text-stone-300">&middot;</span>
          <span>{editor?.getText().length || 0} characters</span>
          <span className="text-stone-300">&middot;</span>
          <span>{Math.max(1, Math.ceil((editor?.getText().trim() ? editor.getText().trim().split(/\s+/).length : 0) / 200))} min read</span>
        </div>

        <div className="flex items-center gap-2">
          {role === 'viewer' ? (
            <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Read-Only Viewer
            </span>
          ) : (
            <span className="text-stone-600 font-medium">
              Editing enabled
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function CollaborativeEditor({
  documentId,
  wsToken,
  role = 'owner',
  activeCommentId = null,
  onSelectComment,
  onAddCommentRequest,
}: CollaborativeEditorProps) {
  const { user } = useAuth();
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

  // Compute stable profile attributes for deterministic cursor appearance
  const currentUser = useMemo(() => {
    const name = user?.name || 'Anonymous User';
    const color = getDeterministicColor(user?.id || user?.email || 'guest');
    return { name, color };
  }, [user]);

  useEffect(() => {
    if (!documentId || !wsToken) return;

    let collabUrl = process.env.NEXT_PUBLIC_COLLAB_URL || 'ws://localhost:1234';
    if (collabUrl.startsWith('https://')) {
      collabUrl = collabUrl.replace(/^https:\/\//, 'wss://');
    } else if (collabUrl.startsWith('http://')) {
      collabUrl = collabUrl.replace(/^http:\/\//, 'ws://');
    }

    const p = new HocuspocusProvider({
      url: collabUrl,
      name: documentId,
      token: wsToken,
      onStatus: ({ status: s }) => {
        setStatus(s);
      },
      onSynced: () => {
        setStatus('connected');
      },
      onDisconnect: () => {
        setStatus('disconnected');
      },
      onAuthenticationFailed: () => {
        setStatus('disconnected');
        p.disconnect();
      },
    });

    setProvider(p);

    return () => {
      p.destroy();
      setProvider(null);
    };
  }, [documentId, wsToken]);

  const toggleConnection = () => {
    if (!provider) return;
    if (isSimulatedOffline) {
      provider.connect();
      setIsSimulatedOffline(false);
    } else {
      provider.disconnect();
      setIsSimulatedOffline(true);
      setStatus('disconnected');
    }
  };

  if (!provider) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-white border border-stone-200 rounded-md">
        <div className="flex items-center gap-2.5 text-xs text-stone-500 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-stone-600" />
          <span>Connecting to collaborative document session...</span>
        </div>
      </div>
    );
  }

  return (
    <EditorCore
      key={documentId}
      provider={provider}
      documentId={documentId}
      role={role}
      status={status}
      activeCommentId={activeCommentId}
      onSelectComment={onSelectComment}
      onAddCommentRequest={onAddCommentRequest}
      currentUser={currentUser}
      isSimulatedOffline={isSimulatedOffline}
      onToggleOffline={toggleConnection}
    />
  );
}

