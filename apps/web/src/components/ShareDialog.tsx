'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  UserPlus,
  Trash2,
  Shield,
  Eye,
  Edit3,
  Check,
  Copy,
  Globe,
  Lock,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

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

import { getApiUrl } from '../utils/config';

const API_URL = getApiUrl();

export function ShareDialog({
  documentId,
  isOpen,
  onClose,
  currentUserRole,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [publicAccess, setPublicAccess] = useState<'private' | 'view' | 'edit'>('edit');
  const [updatingAccess, setUpdatingAccess] = useState(false);
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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load collaborators');
      }

      const data = await res.json();
      setCollaborators(data.collaborators || []);
      if (data.publicAccess) {
        setPublicAccess(data.publicAccess);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error loading collaborators. Please check your connection.');
      }
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error inviting collaborator');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePublicAccess = async (newSetting: 'private' | 'view' | 'edit') => {
    try {
      setUpdatingAccess(true);
      setError(null);
      const res = await fetch(`${API_URL}/documents/${documentId}/permissions/public-access`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ publicAccess: newSetting }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update access setting');
      }

      setPublicAccess(newSetting);
      setSuccess(
        newSetting === 'private'
          ? 'Link access restricted to invited collaborators.'
          : newSetting === 'edit'
          ? 'Anyone with the link can now edit.'
          : 'Anyone with the link can now view.'
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error updating access setting');
      }
    } finally {
      setUpdatingAccess(false);
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
      setSuccess('Role updated successfully');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error updating role');
      }
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error removing collaborator');
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  const isOwner = currentUserRole === 'owner';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white border border-neutral-200 rounded-lg shadow-xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 id="share-dialog-title" className="text-sm font-semibold text-neutral-900">
                Share Document
              </h2>
              <p className="text-xs text-neutral-500">
                Manage who can view, edit, or collaborate on this document.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
            aria-label="Close share dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center justify-between text-xs text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={fetchCollaborators}
                className="inline-flex items-center gap-1 font-medium text-red-800 hover:underline shrink-0"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2 text-xs text-emerald-800">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {/* General Link Access Setting Card */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
                  {publicAccess === 'private' ? (
                    <Lock className="w-3.5 h-3.5 text-neutral-500" />
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-neutral-900">General Access</h3>
                  <p className="text-[11px] text-neutral-500">
                    {publicAccess === 'private'
                      ? 'Only people invited by email can access'
                      : publicAccess === 'edit'
                      ? 'Anyone with the link can edit this document'
                      : 'Anyone with the link can view this document'}
                  </p>
                </div>
              </div>

              {isOwner ? (
                <div className="relative shrink-0">
                  <select
                    value={publicAccess}
                    disabled={updatingAccess}
                    onChange={(e) =>
                      handleUpdatePublicAccess(e.target.value as 'private' | 'view' | 'edit')
                    }
                    className="px-2.5 py-1 text-xs font-medium bg-white border border-neutral-300 rounded-md text-neutral-800 shadow-2xs hover:bg-neutral-50 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
                  >
                    <option value="view">Anyone with link (Viewer)</option>
                    <option value="edit">Anyone with link (Editor)</option>
                    <option value="private">Restricted (Invited only)</option>
                  </select>
                </div>
              ) : (
                <span className="text-xs font-medium px-2 py-1 bg-white border border-neutral-200 rounded-md text-neutral-700 capitalize">
                  {publicAccess}
                </span>
              )}
            </div>

            {/* Copy Link Button */}
            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
              <span className="text-[11px] text-neutral-500 truncate max-w-[260px] font-mono">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-neutral-300 text-neutral-800 rounded-md hover:bg-neutral-50 shadow-2xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Copy link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Invite Form (Owner only) */}
          {isOwner && (
            <div className="space-y-2">
              <label htmlFor="invite-email" className="block text-xs font-semibold text-neutral-800">
                Invite Collaborators by Email
              </label>
              <form onSubmit={handleInvite} className="flex gap-2">
                <input
                  id="invite-email"
                  type="email"
                  required
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-neutral-300 rounded-md shadow-2xs placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-neutral-900"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                  className="px-2.5 py-2 text-xs bg-white border border-neutral-300 rounded-md shadow-2xs text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  aria-label="Select role"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  type="submit"
                  disabled={submitting || !inviteEmail.trim()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 disabled:opacity-50 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900 shrink-0"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>{submitting ? 'Inviting...' : 'Invite'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Collaborator List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-neutral-800">
                Active Collaborators ({collaborators.length})
              </h3>
              <button
                type="button"
                onClick={fetchCollaborators}
                className="text-[11px] text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1"
                title="Refresh list"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="max-h-52 overflow-y-auto divide-y divide-neutral-100 border border-neutral-200 rounded-md bg-white">
              {loading ? (
                <div className="p-6 text-center text-xs text-neutral-500 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                  <span>Loading collaborators...</span>
                </div>
              ) : collaborators.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No explicit collaborators registered yet.
                </div>
              ) : (
                collaborators.map((c) => {
                  const initials = (c.name || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={c.userId}
                      className="flex items-center justify-between p-3 text-xs hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-full bg-neutral-200 text-neutral-800 font-semibold text-[10px] flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-neutral-900 truncate flex items-center gap-1.5">
                            <span>{c.name}</span>
                            {c.isOwner && (
                              <span className="text-[10px] font-semibold bg-neutral-100 text-neutral-800 px-1.5 py-0.2 rounded border border-neutral-200">
                                Owner
                              </span>
                            )}
                          </div>
                          <div className="text-neutral-500 text-[11px] truncate">{c.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {c.isOwner ? (
                          <span className="text-xs text-neutral-500 font-medium px-2 py-1">
                            Owner
                          </span>
                        ) : isOwner ? (
                          <>
                            <select
                              value={c.role}
                              onChange={(e) =>
                                handleChangeRole(c.userId, e.target.value as 'editor' | 'viewer')
                              }
                              className="px-2 py-1 bg-white border border-neutral-200 rounded text-xs text-neutral-800 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                              aria-label={`Change role for ${c.name}`}
                            >
                              <option value="editor">Editor</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemove(c.userId, c.name)}
                              className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-red-50 focus:outline-hidden focus:ring-2 focus:ring-red-600 transition-colors"
                              title={`Remove ${c.name}`}
                              aria-label={`Remove ${c.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-neutral-700 font-medium bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 capitalize">
                            {c.role === 'editor' ? (
                              <Edit3 className="w-3 h-3 text-neutral-600" />
                            ) : (
                              <Eye className="w-3 h-3 text-neutral-600" />
                            )}
                            <span>{c.role}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Permissions are enforced strictly by the server.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
