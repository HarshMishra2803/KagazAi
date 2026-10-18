import { Extension } from '@tiptap/core';
import { yCursorPlugin } from '@tiptap/y-tiptap';

export interface CollaborationCursorOptions {
  provider: any;
  user: {
    name: string;
    color: string;
  };
}

/**
 * TipTap extension that integrates y-protocols awareness with ProseMirror.
 * Renders remote live cursors, participant name tags, and selection ranges.
 */
export const CollaborationCursor = Extension.create<CollaborationCursorOptions>({
  name: 'collaborationCursor',

  addOptions() {
    return {
      provider: null,
      user: {
        name: 'Anonymous',
        color: '#2563eb',
      },
    };
  },

  addProseMirrorPlugins() {
    const provider = this.options.provider;
    if (!provider || !provider.awareness) {
      return [];
    }

    const awareness = provider.awareness;

    // Broadcast local user profile (name, deterministic color) across the awareness channel
    if (this.options.user) {
      awareness.setLocalStateField('user', this.options.user);
    }

    return [
      yCursorPlugin(awareness),
    ];
  },
});
