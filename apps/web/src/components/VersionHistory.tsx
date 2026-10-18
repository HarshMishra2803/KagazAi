'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  Clock,
  RotateCcw,
  X,
  Plus,
  AlertCircle,
  Loader2,
  Eye,
  FileText,
  User,
  Check,
  Trash2,
} from 'lucide-react';

export interface VersionSummary {
  _id: string;
  label: string;
  createdAt: string;
  plainText: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
}

interface VersionHistoryProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  canManageVersions: boolean; // owner or editor can save & restore
  onVersionRestored?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export function VersionHistory({
  documentId,
  isOpen,
  onClose,
  canManageVersions,
  onVersionRestored,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Selected version for preview
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Manual save version state
  const [isSavingOpen, setIsSavingOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [saving, setSaving] = useState(false);

  // Restoring state
  const [restoring, setRestoring] = useState(false);

  const fetchVersions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/documents/${documentId}/versions`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to load version history');
      }

      const data = await res.json();
      setVersions(data.versions || []);
      if (data.versions && data.versions.length > 0) {
        setSelectedVersionId(data.versions[0]._id);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error loading versions');
      }
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
      setError(null);
      setSuccess(null);
      setIsSavingOpen(false);
      setNewLabel('');
    }
  }, [isOpen, fetchVersions]);

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

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(`${API_URL}/documents/${documentId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ label: newLabel.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save version');
      }

      const data = await res.json();
      setSuccess(`Version "${data.version.label}" saved`);
      setNewLabel('');
      setIsSavingOpen(false);
      await fetchVersions();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save version');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (versionId: string, versionLabel: string) => {
    const confirmed = window.confirm(
      `Restore to "${versionLabel}"? Connected collaborators will see the document content update live in real time.`
    );
    if (!confirmed) return;

    try {
      setRestoring(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(`${API_URL}/documents/${documentId}/versions/${versionId}/restore`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to restore version');
      }

      setSuccess(`Restored document to "${versionLabel}"`);
      await fetchVersions();
      if (onVersionRestored) {
        onVersionRestored();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to restore version');
      }
    } finally {
      setRestoring(false);
    }
  };

  const handleDeleteVersion = async (e: React.MouseEvent, versionId: string, versionLabel: string) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Delete version snapshot "${versionLabel}"?`);
    if (!confirmed) return;

    try {
      setError(null);
      const res = await fetch(`${API_URL}/documents/${documentId}/versions/${versionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete version');
      }

      setSuccess(`Version "${versionLabel}" deleted.`);
      setVersions((prev) => prev.filter((v) => v._id !== versionId));
      if (selectedVersionId === versionId) {
        setSelectedVersionId(versions.find((v) => v._id !== versionId)?._id || null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete version');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (!isOpen) return null;

  const activeVersion = versions.find((v) => v._id === selectedVersionId) || versions[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white border-l border-neutral-200 h-full shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-history-title"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-neutral-800" />
            <div>
              <h2 id="version-history-title" className="text-sm font-semibold text-neutral-900">
                Version History
              </h2>
              <p className="text-[11px] text-neutral-500">
                Preview snapshots and restore previous content non-destructively.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canManageVersions && (
              <button
                type="button"
                onClick={() => setIsSavingOpen(!isSavingOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save version</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              aria-label="Close version history"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-xs text-red-700 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2 text-xs text-emerald-700 shrink-0">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {/* Save Version Form Popover */}
        {isSavingOpen && (
          <div className="mx-6 mt-4 p-4 bg-neutral-50 border border-neutral-200 rounded-md shrink-0">
            <form onSubmit={handleSaveVersion} className="space-y-3">
              <label htmlFor="version-label" className="block text-xs font-medium text-neutral-800">
                Version Label
              </label>
              <div className="flex gap-2">
                <input
                  id="version-label"
                  type="text"
                  required
                  autoFocus
                  maxLength={100}
                  placeholder="e.g. Sprint 1 Review Draft"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                />
                <button
                  type="submit"
                  disabled={saving || !newLabel.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 disabled:opacity-50 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSavingOpen(false)}
                  className="px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-300 bg-white rounded-md hover:bg-neutral-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Main Content Area: Split View (List on left, Preview on right) */}
        <div className="flex-1 flex overflow-hidden divide-x divide-neutral-200 mt-2">
          {/* Version List Column */}
          <div className="w-72 shrink-0 overflow-y-auto divide-y divide-neutral-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-neutral-500 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                <span>Loading versions...</span>
              </div>
            ) : versions.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                <History className="w-6 h-6 text-neutral-300 mx-auto mb-2" />
                <p className="font-medium text-neutral-700">No versions saved yet</p>
                <p className="mt-1 text-neutral-400">
                  Versions are captured automatically every 10 minutes or when you save manually.
                </p>
              </div>
            ) : (
              versions.map((v) => {
                const isSelected = v._id === selectedVersionId;
                return (
                  <button
                    key={v._id}
                    type="button"
                    onClick={() => setSelectedVersionId(v._id)}
                    className={`w-full text-left p-3.5 transition-colors block text-xs ${
                      isSelected
                        ? 'bg-neutral-100 border-l-2 border-neutral-900'
                        : 'hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-neutral-900 truncate">
                        {v.label}
                      </span>
                      {canManageVersions && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteVersion(e, v._id, v.label)}
                          className="p-1 text-neutral-400 hover:text-red-600 rounded hover:bg-neutral-200/60 focus:outline-hidden focus:ring-2 focus:ring-red-600 transition-colors shrink-0"
                          title="Delete version snapshot"
                          aria-label={`Delete version ${v.label}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-500">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>{formatDate(v.createdAt)}</span>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-500">
                      <User className="w-3 h-3 text-neutral-400" />
                      <span className="truncate">{v.createdBy?.name || 'Auto-save'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Version Preview Column */}
          <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50/40">
            {activeVersion ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Preview Toolbar */}
                <div className="p-4 border-b border-neutral-200 bg-white flex items-center justify-between gap-4 shrink-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-neutral-500 shrink-0" />
                      <span className="text-xs font-semibold text-neutral-900 truncate">
                        {activeVersion.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Captured on {formatDate(activeVersion.createdAt)} by{' '}
                      {activeVersion.createdBy?.name || 'System'}
                    </p>
                  </div>

                  {canManageVersions && (
                    <button
                      type="button"
                      disabled={restoring}
                      onClick={() => handleRestore(activeVersion._id, activeVersion.label)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900 disabled:opacity-50 shrink-0"
                    >
                      {restoring ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Restoring...</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore this version</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Read-Only Preview Paper */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-xs min-h-[300px]">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 mb-3 flex items-center gap-1.5 pb-2 border-b border-neutral-100">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Read-only Snapshot Content</span>
                    </div>
                    {activeVersion.plainText ? (
                      <div className="text-xs text-neutral-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {activeVersion.plainText}
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-400 italic">
                        (This snapshot had no text content)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-neutral-400">
                Select a version to preview
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
