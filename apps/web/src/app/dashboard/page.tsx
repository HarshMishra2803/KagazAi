'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  Loader2,
  LogOut,
  Clock,
  RefreshCw,
} from 'lucide-react';

export interface DocumentItem {
  _id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [renaming, setRenaming] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchDocuments = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/documents`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to fetch documents');
      }

      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while loading documents.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, fetchDocuments]);

  const handleCreateDocument = async () => {
    setError(null);
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Untitled Document' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create document');
      }

      const data = await res.json();
      setDocuments((prev) => [data.document, ...prev]);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create document. Please try again.');
      }
    } finally {
      setCreating(false);
    }
  };

  const startRenaming = (doc: DocumentItem) => {
    setEditingId(doc._id);
    setEditingTitle(doc.title);
  };

  const cancelRenaming = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const saveRename = async (id: string) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      setError('Document title cannot be empty.');
      return;
    }

    setRenaming(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/documents/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to rename document');
      }

      const data = await res.json();
      setDocuments((prev) =>
        prev.map((doc) => (doc._id === id ? data.document : doc))
      );
      setEditingId(null);
      setEditingTitle('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to rename document.');
      }
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete document');
      }

      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete document.');
      }
    } finally {
      setDeletingId(null);
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

  if (authLoading || (!user && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
          <span>Loading KagazAi...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-neutral-900">
              KagazAi
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-neutral-700">
              <span className="w-7 h-7 rounded-md bg-neutral-200 text-neutral-800 font-medium flex items-center justify-center text-xs">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline font-medium text-xs text-neutral-800">
                {user.name}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">
              Documents
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Manage your personal and collaborative notes, reports, and assignments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchDocuments}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
              title="Refresh list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleCreateDocument}
              disabled={creating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900 disabled:opacity-60"
            >
              {creating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>New document</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="my-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-800"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
            <div className="flex-1">
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Section */}
        <div className="mt-6">
          {loading ? (
            /* Loading State */
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-white border border-neutral-200 rounded-md p-4 animate-pulse flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-neutral-200"></div>
                    <div className="space-y-1.5">
                      <div className="w-36 h-3 bg-neutral-200 rounded"></div>
                      <div className="w-24 h-2.5 bg-neutral-100 rounded"></div>
                    </div>
                  </div>
                  <div className="w-16 h-6 bg-neutral-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-neutral-200 rounded-md p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-md bg-neutral-100 text-neutral-500 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-neutral-900">
                No documents yet
              </h3>
              <p className="mt-1 text-xs text-neutral-500 max-w-sm mx-auto">
                Get started by creating your first document to write notes, assignments, or collaborate in real time.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateDocument}
                  disabled={creating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900 disabled:opacity-60"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create document</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Document List State */
            <div className="bg-white border border-neutral-200 rounded-md divide-y divide-neutral-100 shadow-xs overflow-hidden">
              {documents.map((doc) => {
                const isEditing = editingId === doc._id;
                const isDeleting = deletingId === doc._id;

                return (
                  <div
                    key={doc._id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-md bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveRename(doc._id);
                              if (e.key === 'Escape') cancelRenaming();
                            }}
                            autoFocus
                            disabled={renaming}
                            maxLength={120}
                            className="block w-full px-2.5 py-1 text-sm border border-neutral-300 rounded-md text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                          />
                          <button
                            onClick={() => saveRename(doc._id)}
                            disabled={renaming}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                            title="Save title"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelRenaming}
                            disabled={renaming}
                            className="p-1.5 text-neutral-500 hover:bg-neutral-100 rounded transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-neutral-900 truncate">
                            {doc.title}
                          </h4>
                          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            <span>Updated {formatDate(doc.updatedAt)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => startRenaming(doc)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                          title="Rename document"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Rename</span>
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-red-600 disabled:opacity-50"
                          title="Delete document"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
