'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, UserPlus, Trash2, Shield, Eye, Edit3, Check, Copy } from 'lucide-react';

interface Collaborator {
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  isOwner: boolean;
  invitedBy?: string;
  createdAt?: string;
}

interface ShareDialogProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: 'owner' | 'editor' | 'viewer';
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export function ShareDialog({
  documentId,
  isOpen,
  onClose,
  currentUserRole,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCollaborators = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/documents/${documentId}/permissions`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to load collaborators');
      }

      const data = await res.json();
      setCollaborators(data.collaborators || []);
    } catch (err: any) {
      setError(err.message || 'Error loading collaborators');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (isOpen) {
      fetchCollaborators();
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, fetchCollaborators]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(`${API_URL}/documents/${documentId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: inviteEmail.trim(),
          role: inviteRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to invite user');
      }

      setSuccess(`Invited ${inviteEmail} as ${inviteRole}`);
      setInviteEmail('');
      await fetchCollaborators();
    } catch (err: any) {
      setError(err.message || 'Error inviting collaborator');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'editor' | 'viewer') => {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/documents/${documentId}/permissions/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update role');
      }

      setCollaborators((prev) =>
        prev.map((c) => (c.userId === userId ? { ...c, role: newRole } : c))
      );
    } catch (err: any) {
      setError(err.message || 'Error updating role');
    }
  };

  const handleRemove = async (userId: string, name: string) => {
    if (!confirm(`Remove ${name}'s access to this document?`)) return;

    try {
      setError(null);
      const res = await fetch(`${API_URL}/documents/${documentId}/permissions/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to remove collaborator');
      }

      setCollaborators((prev) => prev.filter((c) => c.userId !== userId));
      setSuccess(`Removed ${name}'s access`);
    } catch (err: any) {
      setError(err.message || 'Error removing collaborator');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const isOwner = currentUserRole === 'owner';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white border border-neutral-300 rounded-lg shadow-lg overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-neutral-700" />
            <h2 id="share-dialog-title" className="text-sm font-semibold text-neutral-900">
              Share Document
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
            aria-label="Close share dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Feedback Alerts */}
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700">
              {success}
            </div>
          )}

          {/* Invite Form (Owner only) */}
          {isOwner ? (
            <form onSubmit={handleInvite} className="space-y-2">
              <label htmlFor="invite-email" className="block text-xs font-medium text-neutral-700">
                Invite by Email
              </label>
              <div className="flex gap-2">
                <input
                  id="invite-email"
                  type="email"
                  required
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                  className="px-2 py-1.5 text-xs bg-white border border-neutral-300 rounded focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  aria-label="Select role"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Adding...' : 'Invite'}</span>
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-neutral-500">
              Only the document owner can invite new collaborators or change roles.
            </p>
          )}

          {/* Collaborator List */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-neutral-700">People with access</h3>
            <div className="max-h-56 overflow-y-auto divide-y divide-neutral-100 border border-neutral-200 rounded">
              {loading ? (
                <div className="p-4 text-center text-xs text-neutral-500">
                  Loading collaborators...
                </div>
              ) : collaborators.length === 0 ? (
                <div className="p-4 text-center text-xs text-neutral-500">
                  No collaborators found.
                </div>
              ) : (
                collaborators.map((c) => (
                  <div key={c.userId} className="flex items-center justify-between p-2.5 text-xs hover:bg-neutral-50/50">
                    <div className="min-w-0 pr-2">
                      <div className="font-medium text-neutral-900 truncate flex items-center gap-1.5">
                        <span>{c.name}</span>
                        {c.isOwner && (
                          <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded border border-neutral-200">
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="text-neutral-500 text-[11px] truncate">{c.email}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.isOwner ? (
                        <span className="text-xs text-neutral-500 font-medium px-2 py-1">
                          Full Access
                        </span>
                      ) : isOwner ? (
                        <>
                          <select
                            value={c.role}
                            onChange={(e) => handleChangeRole(c.userId, e.target.value as 'editor' | 'viewer')}
                            className="px-2 py-1 bg-white border border-neutral-200 rounded text-xs text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                            aria-label={`Change role for ${c.name}`}
                          >
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemove(c.userId, c.name)}
                            className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-red-50 focus:outline-hidden focus:ring-2 focus:ring-red-600"
                            title={`Remove ${c.name}`}
                            aria-label={`Remove ${c.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-600 font-medium bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 capitalize">
                          {c.role === 'editor' ? <Edit3 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {c.role}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Copy Link */}
          <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Anyone with access can open with link</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
