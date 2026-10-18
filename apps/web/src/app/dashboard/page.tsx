'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Search,
  LayoutGrid,
  List as ListIcon,
  Share2,
  Copy,
  Users,
  Shield,
  FilePlus,
  BookOpen,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ShareDialog } from '@/components/ShareDialog';

export interface DocumentItem {
  _id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  role?: 'owner' | 'editor' | 'viewer';
}

import { getApiUrl } from '../../utils/config';

const API_URL = getApiUrl();

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'owned' | 'shared'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Rename State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [renaming, setRenaming] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Share Dialog State
  const [shareDocId, setShareDocId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        const data = await res.json().catch(() => ({}));
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

  const handleCreateDocument = async (customTitle?: string) => {
    setError(null);
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/documents`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: customTitle || 'Untitled Document' }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create document');
      }

      const data = await res.json();
      router.push(`/doc/${data.document._id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create document. Please try again.');
      }
      setCreating(false);
    }
  };

  const handleStartRename = (e: React.MouseEvent, doc: DocumentItem) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(doc._id);
    setEditingTitle(doc.title);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingId(null);
    setEditingTitle('');
  };

  const handleSaveRename = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!editingTitle.trim()) {
      setError('Title cannot be empty');
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
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to rename document');
      }

      const data = await res.json();
      setDocuments((prev) =>
        prev.map((d) => (d._id === id ? { ...d, title: data.document.title } : d))
      );
      setEditingId(null);
      setEditingTitle('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to rename document');
      }
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    e.preventDefault();
    const confirmed = window.confirm(`Permanently delete "${title}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete document');
      }

      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to delete document');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const url = `${window.location.origin}/doc/${docId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(docId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Filtered documents calculation
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // 1. Role filter
      if (activeFilter === 'owned' && doc.role !== 'owner') return false;
      if (activeFilter === 'shared' && doc.role === 'owner') return false;

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return doc.title.toLowerCase().includes(query);
      }
      return true;
    });
  }, [documents, activeFilter, searchQuery]);

  const ownedCount = documents.filter((d) => d.role === 'owner').length;
  const sharedCount = documents.filter((d) => d.role !== 'owner').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-stone-900 font-sans selection:bg-stone-200 selection:text-stone-900">
      {/* Top Navigation */}
      <header className="border-b border-stone-200 bg-[#fafaf9]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2.5 focus:outline-hidden focus:ring-2 focus:ring-stone-900 rounded-md py-1"
            >
              <div className="w-8 h-8 rounded bg-stone-900 text-stone-50 flex items-center justify-center font-bold text-sm shadow-xs">
                K
              </div>
              <span className="text-base font-bold tracking-tight text-stone-900">
                KagazAi
              </span>
            </Link>

            <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-mono hidden sm:inline-block border border-stone-200">
              Workspace
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-stone-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="hidden sm:inline font-medium text-stone-800">{user?.name}</span>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-300 rounded transition-colors focus:outline-hidden focus:ring-2 focus:ring-stone-900 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Quick Document Templates Banner */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Start a New Document
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => handleCreateDocument('Untitled Document')}
              disabled={creating}
              className="p-4 bg-white border border-stone-200 hover:border-stone-400 rounded-md text-left transition-all hover:shadow-xs group flex flex-col justify-between h-28"
            >
              <div className="w-8 h-8 rounded bg-stone-100 text-stone-900 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                <Plus className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-900">Blank Document</div>
                <div className="text-[11px] text-stone-500">Create fresh note</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleCreateDocument('Meeting Notes & Action Items')}
              disabled={creating}
              className="p-4 bg-white border border-stone-200 hover:border-stone-400 rounded-md text-left transition-all hover:shadow-xs group flex flex-col justify-between h-28"
            >
              <div className="w-8 h-8 rounded bg-stone-100 text-stone-900 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-900">Meeting Notes</div>
                <div className="text-[11px] text-stone-500">Agenda &amp; decisions</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleCreateDocument('Project Architecture & RFC')}
              disabled={creating}
              className="p-4 bg-white border border-stone-200 hover:border-stone-400 rounded-md text-left transition-all hover:shadow-xs group flex flex-col justify-between h-28"
            >
              <div className="w-8 h-8 rounded bg-stone-100 text-stone-900 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                <BookOpen className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-900">Architecture RFC</div>
                <div className="text-[11px] text-stone-500">System design spec</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleCreateDocument('Course Assignment Draft')}
              disabled={creating}
              className="p-4 bg-white border border-stone-200 hover:border-stone-400 rounded-md text-left transition-all hover:shadow-xs group flex flex-col justify-between h-28"
            >
              <div className="w-8 h-8 rounded bg-stone-100 text-stone-900 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                <FilePlus className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-semibold text-stone-900">Assignment Report</div>
                <div className="text-[11px] text-stone-500">Student collab draft</div>
              </div>
            </button>
          </div>
        </section>

        {/* Search, Filter Tabs & View Controls */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 border border-stone-200 rounded-md text-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All Documents ({documents.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('owned')}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  activeFilter === 'owned'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Created by me ({ownedCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('shared')}
                className={`px-3 py-1.5 rounded font-medium transition-colors ${
                  activeFilter === 'shared'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Shared with me ({sharedCount})
              </button>
            </div>

            {/* Search Input & Controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-900 shadow-xs"
                />
              </div>

              {/* View Toggle */}
              <div className="flex items-center p-1 bg-stone-100 border border-stone-200 rounded-md">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
                  }`}
                  title="List View"
                >
                  <ListIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={fetchDocuments}
                className="p-2 bg-white border border-stone-300 text-stone-600 hover:text-stone-900 rounded transition-colors shadow-xs"
                title="Refresh documents"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center justify-between text-xs text-red-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={fetchDocuments}
                className="text-red-700 hover:underline shrink-0 font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {/* Documents Content */}
          {loading ? (
            <div className="py-20 text-center text-xs text-stone-500 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-stone-600" />
              <span>Loading workspace documents...</span>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-20 bg-white border border-stone-200 rounded-md text-center p-8 space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-md bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-stone-900">
                {searchQuery ? 'No documents match your search' : 'No documents found'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try searching with different keywords.'
                  : 'Get started by creating your first document above.'}
              </p>
              <button
                type="button"
                onClick={() => handleCreateDocument()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-stone-50 text-xs font-semibold rounded hover:bg-stone-800 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Document</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocs.map((doc) => {
                const isEditing = editingId === doc._id;
                const isDeleting = deletingId === doc._id;

                return (
                  <div
                    key={doc._id}
                    onClick={() => !isEditing && router.push(`/doc/${doc._id}`)}
                    className="p-5 bg-white border border-stone-200 hover:border-stone-400 rounded-md transition-all hover:shadow-xs cursor-pointer flex flex-col justify-between group shadow-2xs"
                  >
                    <div>
                      {/* Card Header: Role Badge & Actions */}
                      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            doc.role === 'owner'
                              ? 'bg-stone-100 text-stone-800 border-stone-200'
                              : doc.role === 'editor'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <Shield className="w-2.5 h-2.5" />
                          <span>{doc.role || 'viewer'}</span>
                        </span>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {/* Copy Link Button */}
                          <button
                            type="button"
                            onClick={(e) => handleCopyLink(e, doc._id)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100 transition-colors"
                            title="Copy link"
                          >
                            {copiedId === doc._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Share Button (Owner or Editor) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShareDocId(doc._id);
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100 transition-colors"
                            title="Share"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Rename Button (Owner or Editor) */}
                          {doc.role !== 'viewer' && (
                            <button
                              type="button"
                              onClick={(e) => handleStartRename(e, doc)}
                              className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100 transition-colors"
                              title="Rename"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Button (Owner only) */}
                          {doc.role === 'owner' && (
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={(e) => handleDelete(e, doc._id, doc.title)}
                              className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-stone-600" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title or Inline Edit */}
                      {isEditing ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 mt-1"
                        >
                          <input
                            type="text"
                            value={editingTitle}
                            autoFocus
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(e as any, doc._id);
                              if (e.key === 'Escape') handleCancelRename(e as any);
                            }}
                            className="flex-1 px-2.5 py-1 text-xs bg-white border border-stone-300 rounded text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 shadow-xs"
                          />
                          <button
                            type="button"
                            disabled={renaming}
                            onClick={(e) => handleSaveRename(e, doc._id)}
                            className="p-1 text-emerald-600 hover:bg-stone-100 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelRename}
                            className="p-1 text-stone-500 hover:bg-stone-100 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-sm font-semibold text-stone-900 group-hover:text-stone-700 transition-colors truncate">
                          {doc.title}
                        </h3>
                      )}
                    </div>

                    <div className="mt-6 flex items-center justify-between text-[11px] text-stone-500 pt-3 border-t border-stone-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>Edited {formatDate(doc.updatedAt)}</span>
                      </span>
                      <span className="text-stone-500 font-mono text-[10px]">CRDT Active</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* LIST VIEW */
            <div className="bg-white border border-stone-200 rounded-md overflow-hidden divide-y divide-stone-100 shadow-xs">
              {filteredDocs.map((doc) => {
                const isEditing = editingId === doc._id;
                const isDeleting = deletingId === doc._id;

                return (
                  <div
                    key={doc._id}
                    onClick={() => !isEditing && router.push(`/doc/${doc._id}`)}
                    className="p-4 hover:bg-stone-50/80 transition-colors flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>

                      {isEditing ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 flex-1 max-w-sm"
                        >
                          <input
                            type="text"
                            value={editingTitle}
                            autoFocus
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(e as any, doc._id);
                              if (e.key === 'Escape') handleCancelRename(e as any);
                            }}
                            className="flex-1 px-2.5 py-1 text-xs bg-white border border-stone-300 rounded text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={(e) => handleSaveRename(e, doc._id)}
                            className="p-1 text-emerald-600 hover:bg-stone-100 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelRename}
                            className="p-1 text-stone-500 hover:bg-stone-100 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <h3 className="text-xs font-semibold text-stone-900 truncate">{doc.title}</h3>
                          <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>Updated {formatDate(doc.updatedAt)}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                          doc.role === 'owner'
                            ? 'bg-stone-100 text-stone-800 border-stone-200'
                            : doc.role === 'editor'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {doc.role || 'viewer'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(e, doc._id)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
                          title="Copy link"
                        >
                          {copiedId === doc._id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShareDocId(doc._id);
                          }}
                          className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
                          title="Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        {doc.role !== 'viewer' && (
                          <button
                            type="button"
                            onClick={(e) => handleStartRename(e, doc)}
                            className="p-1.5 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-100"
                            title="Rename"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {doc.role === 'owner' && (
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={(e) => handleDelete(e, doc._id, doc.title)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded hover:bg-red-50 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Share Dialog Mount */}
        {shareDocId && (
          <ShareDialog
            documentId={shareDocId}
            isOpen={true}
            onClose={() => setShareDocId(null)}
            currentUserRole={
              documents.find((d) => d._id === shareDocId)?.role || 'viewer'
            }
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-[#fafaf9] py-6 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span>KagazAi Workspace</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-stone-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-stone-900 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
