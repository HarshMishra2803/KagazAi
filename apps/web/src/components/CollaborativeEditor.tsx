'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Collaboration from '@tiptap/extension-collaboration';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { EditorToolbar } from './EditorToolbar';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface CollaborativeEditorProps {
  documentId: string;
  wsToken: string;
}

export function CollaborativeEditor({
  documentId,
  wsToken,
}: CollaborativeEditorProps) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

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
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-neutral-900 underline underline-offset-2 hover:text-neutral-600',
          },
        }),
      ],
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class:
            'min-h-[500px] w-full p-8 bg-white border border-neutral-200 rounded-md focus:outline-hidden prose prose-neutral max-w-none text-neutral-900 leading-relaxed font-sans shadow-xs',
        },
      },
    },
    [provider]
  );

  return (
    <div className="w-full space-y-3">
      {/* Collaboration Connection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 bg-white border border-neutral-200 rounded-md shadow-xs text-xs">
        <div className="flex items-center gap-2">
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

          <span className="text-neutral-500 hidden sm:inline">
            Room: <code className="font-mono text-neutral-800">{documentId}</code>
          </span>
        </div>

        <div className="flex items-center gap-2">
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
      <EditorToolbar editor={editor} />

      {/* Editor Content Area */}
      <div className="editor-paper">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
