'use client';

import React, { use, useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CollaborativeEditor } from '@/components/CollaborativeEditor';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  FileText,
  Clock,
  LogOut,
  Users,
} from 'lucide-react';

interface DocumentData {
  _id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

function DocumentView({
  idPromise,
}: {
  idPromise: Promise<{ id: string }>;
}) {
  const { id } = use(idPromise);
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const [document, setDocument] = useState<DocumentData | null>(null);
  const [wsToken, setWsToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchDocumentAndToken = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch document metadata
      const docRes = await fetch(`${API_URL}/documents/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!docRes.ok) {
        if (docRes.status === 404) {
          throw new Error('Document not found or you do not have permission to view it.');
        }
        const data = await docRes.json();
        throw new Error(data.error || 'Failed to load document');
      }

      const docData = await docRes.json();
      setDocument(docData.document);

      // 2. Fetch WebSocket auth token for Hocuspocus
      const tokenRes = await fetch(`${API_URL}/auth/ws-token`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!tokenRes.ok) {
        throw new Error('Failed to obtain real-time session ticket.');
      }

      const tokenData = await tokenRes.json();
      setWsToken(tokenData.token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while loading this document.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (user && id) {
      fetchDocumentAndToken();
    }
  }, [user, id, fetchDocumentAndToken]);

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

  if (authLoading || (loading && (!document || !wsToken) && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-600">
        <div className="flex items-center gap-2.5 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
          <span>Opening collaborative session...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-50">
        <div className="w-full max-w-md bg-white border border-neutral-200 rounded-md p-6 shadow-xs text-center">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="mt-3 text-base font-semibold text-neutral-900">
            Access Error
          </h2>
          <p className="mt-1.5 text-xs text-neutral-600">
            {error}
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!document || !user || !wsToken) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      {/* Top Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                <h1 className="text-sm font-semibold text-neutral-900 truncate">
                  {document.title}
                </h1>
                <span className="text-[10px] uppercase font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded shrink-0">
                  Prompt 4
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                <Clock className="w-3 h-3 text-neutral-400" />
                <span>Updated {formatDate(document.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-600 font-medium bg-neutral-100 px-2 py-1 rounded">
              <Users className="w-3.5 h-3.5 text-neutral-500" />
              CRDT Sync (Yjs)
            </span>

            <div className="h-4 w-px bg-neutral-200 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-md bg-neutral-200 text-neutral-800 font-medium flex items-center justify-center text-xs">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <button
                onClick={() => logout()}
                className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Collaborative Editor Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <CollaborativeEditor
          documentId={document._id}
          wsToken={wsToken}
        />
      </main>
    </div>
  );
}

export default function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-600">
          <div className="flex items-center gap-2.5 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-500" />
            <span>Opening collaborative session...</span>
          </div>
        </div>
      }
    >
      <DocumentView idPromise={params} />
    </Suspense>
  );
}
