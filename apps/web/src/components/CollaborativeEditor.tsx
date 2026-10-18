'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Collaboration from '@tiptap/extension-collaboration';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { EditorToolbar } from './EditorToolbar';
import { CollaborationCursor } from './CollaborationCursorExtension';
import { useAuth } from '../context/AuthContext';
import { getDeterministicColor, getInitials } from '../utils/presence';
import { Wifi, WifiOff, Loader2, Users } from 'lucide-react';

interface CollaborativeEditorProps {
  documentId: string;
  wsToken: string;
  role?: 'owner' | 'editor' | 'viewer';
}

interface Collaborator {
  clientId: number;
  name: string;
  color: string;
  isCurrentUser: boolean;
}

export function CollaborativeEditor({
  documentId,
  wsToken,
  role = 'owner',
}: CollaborativeEditorProps) {
  const { user } = useAuth();
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);

  // Compute stable profile attributes for deterministic cursor appearance
  const currentUser = useMemo(() => {
    const name = user?.name || 'Anonymous User';
    const color = getDeterministicColor(user?.id || user?.email || 'guest');
    return { name, color };
  }, [user]);

  const provider = useMemo(() => {
    const collabUrl = process.env.NEXT_PUBLIC_COLLAB_URL || 'ws://localhost:1234';
    return new HocuspocusProvider({
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
    });
  }, [documentId, wsToken]);

  useEffect(() => {
    return () => {
      provider.destroy();
    };
  }, [provider]);

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

  const toggleConnection = () => {
    if (isSimulatedOffline) {
      provider.connect();
      setIsSimulatedOffline(false);
    } else {
      provider.disconnect();
      setIsSimulatedOffline(true);
      setStatus('disconnected');
    }
  };

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          undoRedo: false, // Yjs handles distributed undo/redo history in collaborative mode
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
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-neutral-900 underline underline-offset-2 hover:text-neutral-600',
          },
        }),
      ],
      editable: role !== 'viewer',
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            'min-h-[500px] w-full p-8 bg-white border border-neutral-200 rounded-md focus:outline-hidden prose prose-neutral max-w-none text-neutral-900 leading-relaxed font-sans shadow-xs',
        },
      },
    },
    [provider, currentUser, role]
  );

  // Synchronize TipTap editable status if role changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(role !== 'viewer');
    }
  }, [editor, role]);

  return (
    <div className="w-full space-y-3">
      {/* Collaboration Connection & Presence Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 bg-white border border-neutral-200 rounded-md shadow-xs text-xs">
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
            <span className="inline-flex items-center gap-1.5 font-medium text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md border border-neutral-200">
              <span className="w-2 h-2 rounded-full bg-neutral-400"></span>
              Offline (Local Mode)
            </span>
          )}

          {/* Active Collaborators Presence Bar */}
          <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
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

            <span className="text-neutral-500 text-[11px] font-medium hidden sm:inline">
              {collaborators.length} {collaborators.length === 1 ? 'collaborator' : 'collaborators'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-neutral-500 hidden md:inline">
            Room: <code className="font-mono text-neutral-800">{documentId.substring(0, 8)}...</code>
          </span>

          <button
            type="button"
            onClick={toggleConnection}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900 ${
              isSimulatedOffline
                ? 'bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800'
                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
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
      <EditorToolbar editor={editor} readOnly={role === 'viewer'} />

      {/* Editor Content Area */}
      <div className="editor-paper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

