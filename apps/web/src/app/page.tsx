'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  FileText,
  Users,
  GitMerge,
  ShieldCheck,
  History,
  MessageSquare,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Radio,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Why does KagazAi use CRDTs instead of Operational Transformation (OT)?',
      a: 'Operational Transformation requires a centralized server to order all operations sequentially, creating a single point of failure and higher latency. Yjs CRDTs (Conflict-Free Replicated Data Types) allow edits to be applied in any order deterministically, enabling true peer-to-peer merging, effortless offline editing, and clean multi-server horizontal scaling with Redis.',
    },
    {
      q: 'How does offline editing work?',
      a: 'When your connection drops, all keystrokes continue to update your local in-memory document state vector. As soon as connectivity returns, your client exchanges state vectors with the Hocuspocus WebSocket server, automatically merging offline edits without overwriting changes made by other editors.',
    },
    {
      q: 'Where are permissions enforced?',
      a: 'Permissions are verified strictly on the backend. When a client requests a WebSocket session, the Express server verifies the user session and issues a cryptographically signed ticket. In the Hocuspocus onAuthenticate hook, the document ownership and permissions are checked in MongoDB before any socket connection or document state is opened.',
    },
    {
      q: 'How does version history restore work without disconnecting users?',
      a: 'Rather than replacing the document on disk and severing active WebSocket connections, KagazAi calculates a forward delta from the selected version and applies it to the active in-memory Y.Doc. All currently connected peers receive the restore event in real time through their existing WebSocket channels.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 font-sans selection:bg-stone-200 selection:text-stone-900 antialiased flex flex-col">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-[#fafaf9]/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded bg-stone-900 text-stone-50 flex items-center justify-center font-semibold text-sm">
              K
            </span>
            <span className="font-semibold text-base tracking-tight text-stone-900">
              KagazAi
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-stone-600">
            <a href="#features" className="hover:text-stone-900 transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-stone-900 transition-colors">
              Architecture
            </a>
            <a href="#faq" className="hover:text-stone-900 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 rounded transition-colors focus:outline-hidden focus:ring-2 focus:ring-stone-900 shadow-xs"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 rounded transition-colors focus:outline-hidden focus:ring-2 focus:ring-stone-900 shadow-xs"
                >
                  <span>Start Writing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Minimalist Hero Section */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-stone-300 bg-white text-[11px] font-medium text-stone-700 mb-6 shadow-xs">
            <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span>KagazAi Real-Time Collaborative Paper</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-stone-900 leading-tight">
            Real-time collaborative writing for students and small teams.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
            KagazAi is a lightweight collaborative document editor built on Yjs CRDTs and WebSockets. Write notes, technical specs, and group assignments together with live cursors and version history.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href={user ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 rounded transition-colors focus:outline-hidden focus:ring-2 focus:ring-stone-900 shadow-xs"
            >
              <span>{user ? 'Open Dashboard' : 'Start Writing Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#architecture"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded transition-colors focus:outline-hidden focus:ring-2 focus:ring-stone-900 shadow-xs"
            >
              <span>System Design</span>
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-[11px] font-medium text-stone-500">
            <span>Zero document locks</span>
            <span className="text-stone-300">&middot;</span>
            <span>Sub-15ms sync latency</span>
            <span className="text-stone-300">&middot;</span>
            <span>Markdown & Rich Text</span>
          </div>
        </div>
      </section>

      {/* 3. Editorial Product Paper Preview */}
      <section className="py-16 sm:py-20 border-b border-stone-200 bg-stone-100/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Live Collaborative Surface
            </span>
          </div>

          {/* Paper Container */}
          <div className="bg-white border border-stone-300/90 rounded-md shadow-xs p-6 sm:p-12">
            {/* Paper Header with Metadata and Live Presence */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-200 text-xs">
              <div>
                <span className="font-mono text-[11px] text-stone-500">DOC_RFC_004</span>
                <h2 className="text-xl sm:text-2xl font-semibold text-stone-900 mt-1">
                  Distributed Systems Specification
                </h2>
                <span className="text-stone-500 text-[11px]">Updated 2 minutes ago</span>
              </div>

              {/* Presence Avatar Stack */}
              <div className="flex items-center gap-2">
                <div className="flex items-center -space-x-1.5 overflow-hidden">
                  <div
                    className="w-7 h-7 rounded-full bg-blue-600 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white"
                    title="Harsh (Owner)"
                  >
                    HS
                  </div>
                  <div
                    className="w-7 h-7 rounded-full bg-emerald-600 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white"
                    title="Priya (Editor)"
                  >
                    PP
                  </div>
                  <div
                    className="w-7 h-7 rounded-full bg-amber-600 text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white"
                    title="Alex (Viewer)"
                  >
                    AK
                  </div>
                </div>
                <span className="text-stone-600 text-xs font-medium pl-1">3 writers active</span>
              </div>
            </div>

            {/* Document Content with Simulated Live Cursors */}
            <div className="space-y-5 text-sm sm:text-base text-stone-800 leading-relaxed font-sans">
              <h3 className="text-lg font-semibold text-stone-900">
                1. Consensus and Conflict-Free Replication
              </h3>

              <p className="relative">
                Traditional collaborative applications rely on centralized operational transformation (OT) where a single server orders every concurrent mutation. In KagazAi, every keystroke is treated as an atomic operation inside a Yjs state vector.
                {/* Live Caret 1: Harsh (Blue) */}
                <span className="inline-block relative ml-0.5">
                  <span className="inline-block w-0.5 h-4.5 bg-blue-600 align-middle"></span>
                  <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white bg-blue-600 whitespace-nowrap shadow-xs">
                    Harsh
                  </span>
                </span>
              </p>

              <div className="p-4 bg-stone-50 border-l-2 border-stone-800 text-stone-700 text-xs sm:text-sm font-mono">
                StateVector(User_A, Clock_412) + Update(Delta) =&gt; ConvergedState
              </div>

              <p className="relative">
                Edits commute deterministically across all peers without centralized lock acquisition. When an editor works offline on a commuter train or intermittent Wi-Fi connection, changes buffer safely in browser memory and reconcile automatically upon reconnecting.
                {/* Live Caret 2: Priya (Emerald) */}
                <span className="inline-block relative ml-0.5">
                  <span className="inline-block w-0.5 h-4.5 bg-emerald-600 align-middle"></span>
                  <span className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white bg-emerald-600 whitespace-nowrap shadow-xs">
                    Priya
                  </span>
                </span>
              </p>
            </div>

            {/* Status Footer */}
            <div className="mt-8 pt-4 border-t border-stone-200 flex flex-wrap items-center justify-between text-[11px] text-stone-500">
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Sync Active (WebSocket Port 1234)
              </span>
              <span>Encrypted via TLS &middot; 482 words</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features (Editorial 4-Column Grid) */}
      <section id="features" className="py-20 border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl mb-12">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Technical Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 mt-2">
              Designed around reliable distributed state.
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-3 leading-relaxed">
              Every component is built to guarantee deterministic convergence, strict role enforcement, and low latency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 bg-white border border-stone-200 rounded-md shadow-xs">
              <span className="font-mono text-xs text-stone-400 font-medium">01</span>
              <h3 className="text-base font-semibold text-stone-900 mt-3">
                Conflict-Free Yjs CRDTs
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                Edits merge mathematically without locking the document or dropping characters. Even under high latency or offline conditions, state vectors converge deterministically.
              </p>
            </div>

            <div className="p-6 bg-white border border-stone-200 rounded-md shadow-xs">
              <span className="font-mono text-xs text-stone-400 font-medium">02</span>
              <h3 className="text-base font-semibold text-stone-900 mt-3">
                Live Presence & Awareness
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                Deterministic color assignments and remote cursor position markers stream over lightweight WebSocket channels, keeping collaborators aligned without UI jitter.
              </p>
            </div>

            <div className="p-6 bg-white border border-stone-200 rounded-md shadow-xs">
              <span className="font-mono text-xs text-stone-400 font-medium">03</span>
              <h3 className="text-base font-semibold text-stone-900 mt-3">
                Automatic Version Checkpoints
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                Automated snapshot triggers capture document state every 10 minutes, with manual labelled saves and live forward-delta restores that do not disconnect peers.
              </p>
            </div>

            <div className="p-6 bg-white border border-stone-200 rounded-md shadow-xs">
              <span className="font-mono text-xs text-stone-400 font-medium">04</span>
              <h3 className="text-base font-semibold text-stone-900 mt-3">
                Server-Enforced Access Roles
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                Owner, Editor, and Viewer privileges are validated on the Express server and verified inside the Hocuspocus onAuthenticate hook. Viewers cannot write even via browser devtools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. System Architecture Section */}
      <section id="architecture" className="py-20 border-b border-stone-200 bg-stone-100/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="max-w-xl mb-12">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 mt-2">
              How data travels from keystroke to persistence.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-stone-200 rounded-md shadow-xs">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm mb-3">
                <FileText className="w-4 h-4 text-stone-700" />
                <span>1. Client Editor</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                TipTap renders the ProseMirror editing surface in the browser. The Collaboration extension binds to the local Y.Doc, applying user keystrokes as atomic CRDT operations.
              </p>
            </div>

            <div className="p-6 bg-white border border-stone-200 rounded-md shadow-xs">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm mb-3">
                <Server className="w-4 h-4 text-stone-700" />
                <span>2. WebSocket Server</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Hocuspocus accepts WebSocket connections, verifies ticket authentication, streams binary updates, and syncs across multiple instances via Redis Pub/Sub channels.
              </p>
            </div>

            <div className="p-6 bg-white border border-stone-200 rounded-md shadow-xs">
              <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm mb-3">
                <Layers className="w-4 h-4 text-stone-700" />
                <span>3. Debounced Storage</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                MongoDB Atlas stores binary update buffers with a 2-second debounce to prevent database write churn, along with plain-text representations for future search.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section id="faq" className="py-20 border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Questions & Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-stone-900 mt-2">
              Frequently asked questions.
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-stone-200 rounded-md shadow-xs overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-stone-900 hover:bg-stone-50 transition-colors focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-4 h-4 text-stone-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA */}
      <section className="py-16 sm:py-20 bg-stone-900 text-stone-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Start collaborating on KagazAi today.
          </h2>
          <p className="mt-3 text-stone-400 text-sm max-w-xl mx-auto">
            Create your account to start writing notes, project proposals, and technical specifications with real-time sync.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href={user ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-stone-900 bg-stone-50 hover:bg-white rounded transition-colors focus:outline-hidden focus:ring-2 focus:ring-white shadow-xs"
            >
              <span>{user ? 'Open Dashboard' : 'Create Free Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Minimalist Footer */}
      <footer className="py-10 bg-[#fafaf9] text-xs text-stone-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-900">KagazAi</span>
            <span className="text-stone-300">&middot;</span>
            <span>Real-time collaborative document editor.</span>
          </div>

          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-stone-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-stone-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="/dashboard" className="hover:text-stone-900 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
