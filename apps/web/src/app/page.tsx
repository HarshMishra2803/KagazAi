'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Users,
  History,
  MessageSquare,
  ShieldCheck,
  Server,
  ArrowRight,
  CheckCircle,
  Eye,
  LogOut,
  Loader2,
} from 'lucide-react';

export default function Home() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200">
      {/* Top Navigation */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 rounded"
          >
            <span className="text-base font-bold tracking-tight text-neutral-900">
              KagazAi
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                <span>Checking session...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-100 text-neutral-700 text-xs font-medium border border-neutral-200 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Real-time collaborative document editor
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 max-w-2xl mx-auto leading-tight">
            A real-time collaborative document editor for students and small teams.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Write notes, assignments, and reports together with live cursors, version history, and inline comment threads.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                >
                  <span>Start writing free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                >
                  <span>Sign in</span>
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Real Editor Interface Preview */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
          <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
            {/* Editor Top Bar Mockup */}
            <div className="px-4 py-2.5 border-b border-neutral-200 bg-neutral-50/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-500" />
                <span className="font-semibold text-neutral-800">CS401 Senior Project Report Draft</span>
                <span className="text-[10px] font-medium text-neutral-500 bg-neutral-200 px-1.5 py-0.5 rounded">
                  Owner
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center -space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                    HM
                  </div>
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                    AK
                  </div>
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                    SP
                  </div>
                </div>
                <span className="text-[11px] text-neutral-500 font-medium hidden sm:inline">
                  3 active
                </span>
              </div>
            </div>

            {/* Editor Toolbar Mockup */}
            <div className="px-4 py-2 border-b border-neutral-100 flex items-center gap-2 text-xs text-neutral-600">
              <span className="font-bold px-1.5 py-0.5 bg-neutral-100 rounded">B</span>
              <span className="italic px-1.5 py-0.5">I</span>
              <span className="px-1.5 py-0.5">H1</span>
              <span className="px-1.5 py-0.5">H2</span>
              <div className="w-px h-3.5 bg-neutral-200"></div>
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-medium inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected (Yjs)
              </span>
            </div>

            {/* Document Content Paper */}
            <div className="p-8 sm:p-12 text-sm leading-relaxed text-neutral-800 space-y-4">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                System Architecture and Distributed Consensus
              </h2>
              <p>
                Collaborative document editors require conflict-free replicated data types (CRDTs) to ensure that concurrent updates from multiple distributed participants mathematically converge without central lock coordination.
              </p>
              <p className="relative">
                <span>In KagazAi, each character is modeled as an atomic item with a globally unique logical timestamp. </span>
                <span className="bg-amber-100 border-b-2 border-amber-500 text-neutral-900 px-1 py-0.5 rounded-xs font-medium">
                  Concurrent typing from multiple peers converges in sub-millisecond time.
                </span>
                <span className="inline-block w-0.5 h-4 bg-emerald-500 align-middle ml-0.5 animate-pulse"></span>
                <span className="inline-block bg-emerald-600 text-white text-[10px] font-semibold px-1 rounded-xs -mt-5 ml-0.5">
                  Alice
                </span>
              </p>
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-600 font-mono">
                p50 latency: 1.00ms | p95 latency: 9.00ms | 0.00% packet loss under 100 concurrent clients
              </div>
            </div>
          </div>
        </section>

        {/* Real Features Grid (No Hyped Copy) */}
        <section className="border-t border-neutral-200 bg-white py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="max-w-xl mb-12">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                Built for reliable collaboration
              </h2>
              <p className="mt-1.5 text-xs text-neutral-600">
                Core features built specifically for real-time document editing and multi-user coordination.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-5 border border-neutral-200 rounded-md bg-neutral-50/50">
                <div className="w-8 h-8 rounded bg-neutral-200 text-neutral-800 flex items-center justify-center mb-3">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Real-time CRDT Synchronization
                </h3>
                <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                  Powered by Yjs and Hocuspocus. Edits merge deterministically without central lock bottlenecks, even across intermittent networks.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-5 border border-neutral-200 rounded-md bg-neutral-50/50">
                <div className="w-8 h-8 rounded bg-neutral-200 text-neutral-800 flex items-center justify-center mb-3">
                  <Eye className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Presence and Live Cursors
                </h3>
                <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                  Real-time cursor positions, text selection highlights, and presence avatars with deterministic user colors.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-5 border border-neutral-200 rounded-md bg-neutral-50/50">
                <div className="w-8 h-8 rounded bg-neutral-200 text-neutral-800 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Role-Based Permissions
                </h3>
                <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                  Invite collaborators as owner, editor, or viewer. Permissions are enforced on the server network socket to prevent unauthorized mutations.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-5 border border-neutral-200 rounded-md bg-neutral-50/50">
                <div className="w-8 h-8 rounded bg-neutral-200 text-neutral-800 flex items-center justify-center mb-3">
                  <History className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Version History & Restore
                </h3>
                <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                  Automatic snapshots every 10 minutes of active editing, manual labelled versions, and real-time forward-delta restore without client disconnects.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-5 border border-neutral-200 rounded-md bg-neutral-50/50">
                <div className="w-8 h-8 rounded bg-neutral-200 text-neutral-800 flex items-center justify-center mb-3">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Inline Comment Threads
                </h3>
                <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                  Comments are anchored directly to words using CRDT marks rather than character offsets, preventing drift when earlier text is edited.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-5 border border-neutral-200 rounded-md bg-neutral-50/50">
                <div className="w-8 h-8 rounded bg-neutral-200 text-neutral-800 flex items-center justify-center mb-3">
                  <Server className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-neutral-900">
                  Horizontal Scaling with Redis
                </h3>
                <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
                  Multi-node server deployment using Redis pub/sub backplane and Nginx load balancing for resilient horizontal scaling.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8 text-xs text-neutral-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">KagazAi</span>
            <span>Collab Editor</span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-neutral-600 hover:text-neutral-900 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900 rounded"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-neutral-600 hover:text-neutral-900 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900 rounded"
            >
              Terms of Service
            </Link>
            <Link
              href="/dashboard"
              className="text-neutral-600 hover:text-neutral-900 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900 rounded"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
