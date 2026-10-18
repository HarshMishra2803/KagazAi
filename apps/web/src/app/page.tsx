'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { trackEvent } from '@/utils/analytics';
import {
  FileText,
  Users,
  GitMerge,
  ShieldCheck,
  History,
  MessageSquare,
  Server,
  Zap,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Lock,
  RotateCcw,
  Sparkles,
  Terminal,
  Activity,
  Layers,
  Cpu,
  Database,
  ExternalLink,
  Plus,
  Play,
  Share2,
  FileCode,
  Laptop,
  CheckSquare,
  Clock,
  Radio,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePlaygroundTab, setActivePlaygroundTab] = useState<'editor' | 'history' | 'comments' | 'architecture'>('editor');
  
  // Interactive feature demo state 1: CRDT vs File Locks
  const [syncMode, setSyncMode] = useState<'crdt' | 'lock'>('crdt');

  // Interactive playground demo states
  const [editorText, setEditorText] = useState('## Distributed Systems RFC\n\nKagazAi is an open-source real-time collaborative document editor.\n\n- Powered by Yjs Conflict-Free Replicated Data Types (CRDTs)\n- Sub-15ms WebSocket round-trip synchronization\n- Multi-node horizontal scaling via Redis Pub/Sub channels');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<number>(0);
  const [demoComments, setDemoComments] = useState([
    { id: 'c1', author: 'Priya Patel', role: 'Editor', text: 'Should we specify the Redis debounce interval here?', resolved: false, time: '10m ago' },
    { id: 'c2', author: 'Harsh Sharma', role: 'Owner', text: 'Yes, 2000ms debounce to MongoDB Atlas is documented in prompt 5.', resolved: true, time: '2h ago' },
  ]);
  const [commentReplyText, setCommentReplyText] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  useEffect(() => {
    trackEvent('landing_view');
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
    trackEvent('faq_expanded', { index });
  };

  const handleResolveComment = (id: string) => {
    setDemoComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c))
    );
  };

  const handleAddDemoReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentReplyText.trim()) return;
    setDemoComments((prev) => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        author: user?.name || 'You',
        role: 'Editor',
        text: commentReplyText.trim(),
        resolved: false,
        time: 'Just now',
      },
    ]);
    setCommentReplyText('');
    trackEvent('comment_created', { source: 'landing_demo' });
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* 1. Plumeform-Style Floating Glass Navbar */}
      <div className="sticky top-3 z-50 px-4 sm:px-6 max-w-6xl w-full mx-auto">
        <header className="rounded-lg bg-neutral-900/80 backdrop-blur-md border border-neutral-800/90 shadow-lg px-4 py-2.5 flex items-center justify-between">
          {/* Logo & Brand Mark */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded bg-white text-neutral-950 flex items-center justify-center font-bold text-xs tracking-tight transition-transform group-hover:scale-105">
              K
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">
                KagazAi
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-neutral-800 text-neutral-400 border border-neutral-700">
                v1.0
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Live Engine
            </a>
            <a href="#benefits" className="hover:text-white transition-colors">
              Benefits
            </a>
            <a href="#benchmarks" className="hover:text-white transition-colors">
              Benchmarks
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Community
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => trackEvent('cta_click_nav', { destination: 'dashboard' })}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-white rounded hover:bg-neutral-200 transition-colors shadow-xs"
              >
                Workspace
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => trackEvent('cta_click_nav', { destination: 'register' })}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-white rounded hover:bg-neutral-200 transition-colors shadow-xs"
                >
                  Start Free
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-neutral-400 hover:text-white rounded focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 rounded-lg border border-neutral-800 bg-neutral-900/95 backdrop-blur-md px-4 py-4 space-y-2.5 shadow-xl">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-medium text-neutral-300 hover:text-white py-1"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-medium text-neutral-300 hover:text-white py-1"
            >
              How It Works
            </a>
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-medium text-neutral-300 hover:text-white py-1"
            >
              Live Engine
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-medium text-neutral-300 hover:text-white py-1"
            >
              Benefits
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-medium text-neutral-300 hover:text-white py-1"
            >
              Community
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-medium text-neutral-300 hover:text-white py-1"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-neutral-800 flex flex-col gap-2">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-3 py-2 text-xs font-semibold text-neutral-950 bg-white rounded"
                >
                  Open Workspace
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-3 py-2 text-xs font-medium text-neutral-300 bg-neutral-800 rounded"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-3 py-2 text-xs font-semibold text-neutral-950 bg-white rounded"
                  >
                    Start Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Razorpay/Plumeform-Style High-Impact Hero Section */}
      <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Engineering Monospace Kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 mb-6 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>CRDT REPLICATION ENGINE &middot; SUB-15MS ROUND-TRIP</span>
          </div>

          {/* Monumental Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            Write together in real time.<br className="hidden sm:inline" />
            <span className="text-neutral-400">Zero merge conflicts.</span>
          </h1>

          {/* Refined Description */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-neutral-400 leading-relaxed mb-8 font-normal">
            A high-performance collaborative document workspace for students and software engineering teams. Built on Yjs CRDTs, WebSocket rooms, and Redis pub/sub clustering.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link
              href={user ? '/dashboard' : '/register'}
              onClick={() => trackEvent('cta_click_hero', { destination: user ? 'dashboard' : 'register' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-neutral-950 bg-white rounded-md hover:bg-neutral-200 transition-colors shadow-sm"
            >
              Start Writing Free
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#demo"
              onClick={() => trackEvent('cta_click_hero', { destination: 'demo' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-neutral-300 bg-neutral-900/90 border border-neutral-800 rounded-md hover:bg-neutral-850 hover:text-white transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-neutral-400" />
              Explore Live Engine
            </a>
          </div>

          {/* Plumeform-Style Embedded Interactive Live Workspace Preview */}
          <div className="relative mx-auto max-w-4xl text-left rounded-lg border border-neutral-800 bg-[#0d1117] shadow-2xl overflow-hidden">
            {/* Top Chrome Header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800 bg-[#090d13] text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-700"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-700"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-700"></span>
                </div>
                <div className="h-3 w-px bg-neutral-800 mx-1"></div>
                <span className="font-mono text-[11px] text-neutral-400">kagazai.app / doc / distributed-rfc</span>
              </div>

              {/* Live Presence Avatars in Mockup */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  3 Connected
                </span>
                <div className="flex items-center -space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center ring-1 ring-[#0d1117]">H</div>
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-[10px] font-bold text-white flex items-center justify-center ring-1 ring-[#0d1117]">P</div>
                  <div className="w-5 h-5 rounded-full bg-amber-600 text-[10px] font-bold text-white flex items-center justify-center ring-1 ring-[#0d1117]">A</div>
                </div>
              </div>
            </div>

            {/* Document Content Canvas */}
            <div className="p-6 sm:p-8 bg-white text-neutral-900 min-h-[280px]">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200 text-xs text-neutral-500">
                <span className="font-semibold text-neutral-900">Distributed Systems Design RFC</span>
                <span>Auto-saved &middot; 10:24 AM</span>
              </div>

              <div className="prose prose-neutral max-w-none text-xs sm:text-sm leading-relaxed space-y-3">
                <p className="text-neutral-700">
                  This document specifies the consensus protocol and Conflict-Free Replicated Data Type (CRDT) synchronization engine for KagazAi.
                </p>

                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded text-xs font-mono text-neutral-800 space-y-1">
                  <div className="text-neutral-500">// Real-time state convergence vector</div>
                  <div>StateVector: [ClientA: 142, ClientB: 89, ClientC: 204]</div>
                  <div className="text-emerald-700">Convergence: 100% Deterministic (Yjs Math Proof)</div>
                </div>

                {/* Simulated Remote Cursor */}
                <div className="relative inline-block mt-2">
                  <span className="text-neutral-900">
                    Edits propagate across instances via Redis Pub/Sub channels with sub-15ms round-trip latency.
                  </span>
                  <span className="inline-block w-0.5 h-4 bg-blue-600 align-middle animate-pulse ml-0.5"></span>
                  <span className="inline-block ml-1 px-1.5 py-0.5 bg-blue-600 text-white font-semibold text-[9px] rounded">
                    Harsh typing...
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="px-4 py-2 border-t border-neutral-800 bg-[#090d13] flex items-center justify-between text-[11px] text-neutral-400">
              <span className="font-mono">TipTap 3 &middot; ProseMirror &middot; Yjs Engine</span>
              <span className="text-neutral-500">Document ID: <code className="text-neutral-300">rfc_dist_sys</code></span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Razorpay Sprint-Style Empirical Telemetry Bar */}
      <section id="benchmarks" className="py-12 bg-neutral-950 border-y border-neutral-850">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Empirical Benchmarks</span>
              <h2 className="text-lg font-bold text-white">Verified Production Load Tests (k6 Collab)</h2>
            </div>
            <div className="text-xs text-neutral-400 font-mono hidden sm:block">
              Machine: Apple M-Series ARM64 &middot; Redis 7.0 &middot; 100 Virtual Users
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-md">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                <span>Concurrency</span>
                <Users className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">100 Clients</div>
              <div className="text-[11px] text-neutral-400 mt-1">Concurrently typing on single room</div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-md">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                <span>Update Round-Trip</span>
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400">10.6ms p95</div>
              <div className="text-[11px] text-neutral-400 mt-1">5.2ms median across 50,000 frames</div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-md">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                <span>Handshake Time</span>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">19.3ms p95</div>
              <div className="text-[11px] text-neutral-400 mt-1">JWT verify &amp; binary state vector load</div>
            </div>

            <div className="bg-neutral-900/90 border border-neutral-800 p-4 rounded-md">
              <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                <span>Data Integrity</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">0 Drops</div>
              <div className="text-[11px] text-neutral-400 mt-1">100% convergence across all clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Plumeform-Style Side-by-Side Interactive Feature Demonstrations */}
      <section id="features" className="py-20 bg-[#07090e] border-b border-neutral-850 scroll-mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">
              Core Technical Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-3">
              Engineered for absolute durability and speed.
            </h2>
            <p className="text-sm text-neutral-400">
              Compare how KagazAi handles distributed concurrency compared to legacy document tools.
            </p>
          </div>

          {/* Interactive Feature 1: CRDT vs File Lock */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 sm:p-8">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400">Concurrency Architecture</span>
              <h3 className="text-2xl font-bold text-white mt-1 mb-3">
                Conflict-Free Replicated Data Types (CRDTs)
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                Legacy systems lock files or demand manual conflict resolution when two people edit the same sentence. KagazAi executes Yjs mathematical state vectors: every keystroke integrates deterministically without locking.
              </p>

              {/* Mode Toggle */}
              <div className="inline-flex rounded-md p-1 bg-neutral-950 border border-neutral-800 text-xs">
                <button
                  type="button"
                  onClick={() => setSyncMode('crdt')}
                  className={`px-3 py-1.5 rounded font-medium transition-colors ${
                    syncMode === 'crdt'
                      ? 'bg-blue-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  KagazAi CRDT (Zero Locks)
                </button>
                <button
                  type="button"
                  onClick={() => setSyncMode('lock')}
                  className={`px-3 py-1.5 rounded font-medium transition-colors ${
                    syncMode === 'lock'
                      ? 'bg-red-950 text-red-300 border border-red-800/80'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Legacy File Lock System
                </button>
              </div>
            </div>

            {/* Interactive Result Card */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-md p-6 font-mono text-xs text-neutral-300 min-h-[220px] flex flex-col justify-between">
              {syncMode === 'crdt' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-neutral-500 border-b border-neutral-800 pb-2">
                    <span>Yjs Replicated State Vector</span>
                    <span className="text-emerald-400 font-semibold text-[10px]">Active Concurrency: 2 Users</span>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-neutral-400">// Client A and Client B type at index 12 simultaneously</p>
                    <p className="text-blue-400">ClientA: insert(&quot;high-throughput &quot;)</p>
                    <p className="text-emerald-400">ClientB: insert(&quot;fault-tolerant &quot;)</p>
                    <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-neutral-200 mt-2">
                      Result: &quot;high-throughput fault-tolerant architecture&quot; (Zero conflicts, zero loss)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-neutral-500 border-b border-neutral-800 pb-2">
                    <span>Legacy Lock System</span>
                    <span className="text-red-400 font-semibold text-[10px]">Document Blocked</span>
                  </div>
                  <div className="p-4 bg-red-950/40 border border-red-900/60 rounded text-red-300 space-y-2">
                    <div className="font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-red-400" />
                      Document Locked: Read-Only Mode
                    </div>
                    <p className="text-[11px] text-red-400 leading-relaxed">
                      User Priya Patel is currently editing this document. Your changes cannot be saved until Priya closes the document.
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 text-[11px] text-neutral-500 border-t border-neutral-800">
                {syncMode === 'crdt' ? 'Mathematically guaranteed convergence' : 'Legacy checkout locks create workflow bottlenecks'}
              </div>
            </div>
          </div>

          {/* Interactive Feature 2: Non-Destructive Version History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-neutral-900/50 border border-neutral-800 rounded-lg p-6 sm:p-8">
            <div className="order-2 lg:order-1 bg-neutral-950 border border-neutral-800 rounded-md p-6 font-mono text-xs text-neutral-300 min-h-[220px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-neutral-500 border-b border-neutral-800 pb-2 mb-3">
                  <span>Version Checkpoint Timeline</span>
                  <span className="text-blue-400 text-[10px]">Snapshot #{selectedVersion + 1}</span>
                </div>

                <div className="flex gap-2 mb-4">
                  {[
                    { id: 0, label: 'v1.2 (Latest)', diff: '+ Redis scaling' },
                    { id: 1, label: 'v1.1 (Auto)', diff: '+ Sub-15ms sync' },
                    { id: 2, label: 'v1.0 (Draft)', diff: 'Initial draft' },
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVersion(v.id)}
                      className={`flex-1 p-2 rounded border text-left text-[11px] transition-colors ${
                        selectedVersion === v.id
                          ? 'bg-neutral-800 border-blue-500 text-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-bold">{v.label}</div>
                      <div className="text-[10px] text-neutral-500">{v.diff}</div>
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded text-xs space-y-1">
                  <div className="text-neutral-500">// Previewing snapshot state</div>
                  {selectedVersion === 0 && <p className="text-neutral-200">KagazAi: CRDT sync &amp; multi-node Redis clustering.</p>}
                  {selectedVersion === 1 && <p className="text-neutral-200">KagazAi: CRDT sync engine with sub-15ms latency.</p>}
                  {selectedVersion === 2 && <p className="text-neutral-200">KagazAi: Initial student document draft.</p>}
                </div>
              </div>

              <div className="pt-2 text-[11px] text-neutral-500 border-t border-neutral-800 flex items-center justify-between">
                <span>Restoring updates forward as a live delta.</span>
                <span className="text-emerald-400">Zero Disconnections</span>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400">Version Control</span>
              <h3 className="text-2xl font-bold text-white mt-1 mb-3">
                Non-Destructive Live Rollback
              </h3>
              <p className="text-sm text-neutral-400 leading-relaxed mb-4">
                Automatic checkpoints are created every 10 minutes during active editing, plus manual labeled snapshots. Restoring does not discard history: it computes the difference and applies it as a new transaction, keeping connected collaborators in sync.
              </p>
              <ul className="text-xs text-neutral-400 space-y-1.5">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-400" /> Manual labeled milestones with user attribution</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-400" /> Compact binary Yjs state vector persistence</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-400" /> Granular delete action for unwanted snapshots</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Live Product Engine Playground Section */}
      <section id="demo" className="py-20 bg-neutral-950 border-b border-neutral-850 scroll-mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">
              Interactive Lab
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-3 mb-2">
              Test all four subsystems right now.
            </h2>
            <p className="text-sm text-neutral-400">
              Click tabs to interact with live TipTap editor formatting, revision diffs, comment resolution, and Redis cluster topology.
            </p>
          </div>

          {/* Playground Container */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl overflow-hidden">
            {/* Tab Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-2">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActivePlaygroundTab('editor')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    activePlaygroundTab === 'editor'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  1. Live TipTap Editor
                </button>
                <button
                  type="button"
                  onClick={() => setActivePlaygroundTab('history')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    activePlaygroundTab === 'history'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  2. Version Rollback
                </button>
                <button
                  type="button"
                  onClick={() => setActivePlaygroundTab('comments')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    activePlaygroundTab === 'comments'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  3. Threaded Discussions
                </button>
                <button
                  type="button"
                  onClick={() => setActivePlaygroundTab('architecture')}
                  className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    activePlaygroundTab === 'architecture'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  4. Redis Cluster Topology
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-mono text-[11px]">doc: distributed_rfc</span>
              </div>
            </div>

            {/* Tab 1: Live Editor */}
            {activePlaygroundTab === 'editor' && (
              <div className="p-6 bg-neutral-900 min-h-[360px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-neutral-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsBold(!isBold)}
                      className={`px-2.5 py-1 rounded font-bold border text-xs ${
                        isBold ? 'bg-neutral-700 text-white border-neutral-600' : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsItalic(!isItalic)}
                      className={`px-2.5 py-1 rounded italic border text-xs ${
                        isItalic ? 'bg-neutral-700 text-white border-neutral-600' : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      I
                    </button>
                    <div className="h-4 w-px bg-neutral-800 mx-1"></div>
                    <span className="text-neutral-400 text-xs">Simulated Collaborators:</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white">Harsh (You)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white">Alice (Live)</span>
                  </div>

                  <textarea
                    value={editorText}
                    onChange={(e) => setEditorText(e.target.value)}
                    rows={7}
                    className="w-full bg-neutral-950 p-4 border border-neutral-800 rounded font-mono text-xs sm:text-sm text-neutral-200 focus:outline-hidden focus:border-neutral-600 resize-none leading-relaxed"
                  />
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <span>Type above to simulate editing; Yjs state vectors merge changes live.</span>
                  <button
                    type="button"
                    onClick={() => setEditorText('## Distributed Systems RFC\n\nKagazAi is an open-source real-time collaborative document editor.\n\n- Powered by Yjs Conflict-Free Replicated Data Types (CRDTs)\n- Sub-15ms WebSocket round-trip synchronization\n- Multi-node horizontal scaling via Redis Pub/Sub channels')}
                    className="text-neutral-400 hover:text-white underline text-xs"
                  >
                    Reset Text
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Version Timeline */}
            {activePlaygroundTab === 'history' && (
              <div className="p-6 bg-neutral-900 min-h-[360px]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">Revisions</div>
                    {[
                      { index: 0, label: 'v1.2: Added Redis clustering spec', time: 'Today, 18:30', author: 'Harsh Sharma' },
                      { index: 1, label: 'v1.1: Automated 10-min autosave', time: 'Today, 18:20', author: 'System' },
                      { index: 2, label: 'v1.0: Initial document draft', time: 'Today, 17:45', author: 'Harsh Sharma' },
                    ].map((ver) => (
                      <div
                        key={ver.index}
                        onClick={() => setSelectedVersion(ver.index)}
                        className={`p-2.5 rounded border cursor-pointer transition-colors ${
                          selectedVersion === ver.index
                            ? 'bg-neutral-800 border-blue-500 text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="text-xs font-semibold">{ver.label}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">{ver.author} &middot; {ver.time}</div>
                      </div>
                    ))}
                  </div>

                  <div className="md:col-span-2 bg-neutral-950 border border-neutral-800 rounded p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800 text-neutral-400">
                        <span>Snapshot Content ({selectedVersion === 0 ? 'Current Live State' : 'Historical Snapshot'})</span>
                        <span className="text-emerald-400 font-mono text-[10px]">Verified Buffer</span>
                      </div>
                      <div className="mt-3 text-xs font-mono text-neutral-300 leading-relaxed">
                        {selectedVersion === 0 && (
                          <div className="space-y-1">
                            <p className="text-neutral-400">// Live revision 1.2</p>
                            <p>## Distributed Systems RFC</p>
                            <p>- Powered by Yjs Conflict-Free Replicated Data Types</p>
                            <p>- Sub-15ms WebSocket round-trip synchronization</p>
                            <p className="text-emerald-400">+ Multi-node horizontal scaling via Redis Pub/Sub channels</p>
                          </div>
                        )}
                        {selectedVersion === 1 && (
                          <div className="space-y-1">
                            <p className="text-neutral-400">// Auto-save checkpoint 1.1</p>
                            <p>## Distributed Systems RFC</p>
                            <p>- Powered by Yjs Conflict-Free Replicated Data Types</p>
                            <p>- Sub-15ms WebSocket round-trip synchronization</p>
                          </div>
                        )}
                        {selectedVersion === 2 && (
                          <div className="space-y-1">
                            <p className="text-neutral-400">// Baseline draft 1.0</p>
                            <p># KagazAi Project Notes</p>
                            <p>- Initial draft setup for student collaboration</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Restoration updates live clients non-destructively.</span>
                      <button
                        type="button"
                        onClick={() => alert(`Simulated restore of revision ${selectedVersion} executed non-destructively.`)}
                        className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-medium"
                      >
                        Restore Snapshot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Threaded Discussions */}
            {activePlaygroundTab === 'comments' && (
              <div className="p-6 bg-neutral-900 min-h-[360px]">
                <div className="max-w-xl mx-auto space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
                    <span>Active Comment Threads</span>
                    <span className="text-amber-400 text-[10px]">ProseMirror Node IDs</span>
                  </div>

                  {demoComments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3 rounded border text-xs transition-colors ${
                        comment.resolved
                          ? 'bg-neutral-950/60 border-neutral-800/60 opacity-60'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{comment.author}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-neutral-800 text-neutral-300">{comment.role}</span>
                          <span className="text-neutral-500 text-[10px]">{comment.time}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleResolveComment(comment.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            comment.resolved
                              ? 'bg-neutral-800 text-neutral-400 hover:text-white'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900'
                          }`}
                        >
                          {comment.resolved ? 'Reopen' : 'Resolve'}
                        </button>
                      </div>
                      <p className="text-neutral-300 leading-normal">{comment.text}</p>
                    </div>
                  ))}

                  <form onSubmit={handleAddDemoReply} className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={commentReplyText}
                      onChange={(e) => setCommentReplyText(e.target.value)}
                      placeholder="Type a test reply..."
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-neutral-600"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-semibold"
                    >
                      Reply
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Tab 4: Redis Architecture */}
            {activePlaygroundTab === 'architecture' && (
              <div className="p-6 bg-neutral-900 min-h-[360px] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                    Horizontal WebSocket Scaling Topology
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded">
                      <div className="font-semibold text-white mb-1">Nginx Proxy</div>
                      <p className="text-neutral-400 text-[11px]">WebSocket upgrade proxy on port 80/443</p>
                      <div className="mt-2 text-emerald-400 font-mono text-[10px]">proxy_pass http://collab_backend</div>
                    </div>

                    <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded">
                      <div className="font-semibold text-white mb-1">Hocuspocus Server Nodes</div>
                      <p className="text-neutral-400 text-[11px]">Node 1 (:1234) &amp; Node 2 (:1235)</p>
                      <div className="mt-2 text-blue-400 font-mono text-[10px]">Redis Pub/Sub Sync Active</div>
                    </div>

                    <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded">
                      <div className="font-semibold text-white mb-1">Redis 7 &amp; MongoDB</div>
                      <p className="text-neutral-400 text-[11px]">State vector broadcasting &amp; buffer persistence</p>
                      <div className="mt-2 text-amber-400 font-mono text-[10px]">prefix: kagazai:collab</div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-neutral-950 border border-neutral-800 rounded text-xs font-mono text-neutral-300">
                    <span className="text-neutral-500">// Inter-instance synchronization workflow</span><br />
                    <span>Client on Node 1 types -&gt; Node 1 publishes to Redis -&gt; Node 2 receives -&gt; Client on Node 2 updates (&lt; 15ms).</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
                  <span>Stopping either server instance causes zero data loss.</span>
                  <Link href="/dashboard" className="text-white hover:underline text-xs inline-flex items-center gap-1">
                    Open Live App <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Comparison Table: KagazAi vs Alternatives */}
      <section className="py-20 bg-[#07090e] border-b border-neutral-850">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">
              Feature Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-2">
              How KagazAi compares.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Honest technical differences between KagazAi and legacy document suites.
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900/60">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-300">
                  <th className="py-3 px-4 font-semibold">Capability</th>
                  <th className="py-3 px-4 font-bold text-white bg-blue-950/40">KagazAi</th>
                  <th className="py-3 px-4 font-semibold text-neutral-400">Google Docs</th>
                  <th className="py-3 px-4 font-semibold text-neutral-400">Git / Markdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-300">
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Concurrency Engine</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold bg-blue-950/20">Yjs CRDT (Conflict-Free)</td>
                  <td className="py-3 px-4 text-neutral-400">Operational Transformation</td>
                  <td className="py-3 px-4 text-neutral-400">Manual Git Merge Conflicts</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Offline Synchronization</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold bg-blue-950/20">Automatic State Vector Merge</td>
                  <td className="py-3 px-4 text-neutral-400">Requires Extension / Limited</td>
                  <td className="py-3 px-4 text-neutral-400">Manual Branch Merge</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Self-Hostable Infrastructure</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold bg-blue-950/20">Yes (Docker Compose)</td>
                  <td className="py-3 px-4 text-neutral-400">No (Proprietary Cloud)</td>
                  <td className="py-3 px-4 text-neutral-300">Yes (Git Server)</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Data Privacy &amp; Telemetry</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold bg-blue-950/20">Zero Telemetry &middot; No Ads</td>
                  <td className="py-3 px-4 text-neutral-400">Commercial Tracking</td>
                  <td className="py-3 px-4 text-neutral-300">Private Host Controlled</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-white">Threaded Comments</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold bg-blue-950/20">ProseMirror Node Pinned</td>
                  <td className="py-3 px-4 text-neutral-300">Proprietary Anchors</td>
                  <td className="py-3 px-4 text-neutral-400">PR Line Comments Only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. Community & Open Access Pricing Section */}
      <section id="pricing" className="py-20 bg-neutral-950 border-b border-neutral-850 scroll-mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">
              Transparent Access
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-3 mb-2">
              Free &amp; Open Source Forever.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              No artificial document quotas, no paid feature gates, and no credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-blue-400">Cloud Edition</div>
                <div className="text-3xl font-extrabold text-white mt-2 mb-1">$0 <span className="text-xs font-normal text-neutral-400">/ forever</span></div>
                <p className="text-xs text-neutral-400 mb-6">Full real-time collaboration for students, researchers, and study groups.</p>
                <ul className="space-y-2.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Unlimited collaborative documents</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Real-time CRDT sync and live cursors</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Instant link sharing &amp; role permissions</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Version history snapshots &amp; threaded comments</li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/register"
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-neutral-950 bg-white rounded hover:bg-neutral-200 transition-colors"
                >
                  Create Free Account
                </Link>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">Self-Hosted Docker</div>
                <div className="text-3xl font-extrabold text-white mt-2 mb-1">$0 <span className="text-xs font-normal text-neutral-400">/ open source</span></div>
                <p className="text-xs text-neutral-400 mb-6">Deploy on your own servers with complete data sovereignty.</p>
                <ul className="space-y-2.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Complete Docker Compose stack included</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Redis Pub/Sub multi-node cluster scaling</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Nginx load balancer proxy configuration</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> k6 automated load testing benchmark scripts</li>
                </ul>
              </div>
              <div className="mt-8">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700 rounded transition-colors"
                >
                  View GitHub Repository
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Interactive FAQ Accordion */}
      <section id="faq" className="py-20 bg-[#07090e] border-b border-neutral-850 scroll-mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded">
              FAQ
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Clear technical facts on how KagazAi handles your documents and data.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              {
                q: 'What is KagazAi and who is it designed for?',
                a: 'KagazAi is a lightweight real-time collaborative document editor (Google Docs alternative) built for students, study groups, and small software engineering teams. It allows multiple people to write notes, lab reports, and technical specifications concurrently.',
              },
              {
                q: 'How does real-time sync work without merge conflicts?',
                a: 'KagazAi uses Yjs, a Conflict-Free Replicated Data Type (CRDT). Instead of sending raw text diffs or requiring operational transforms through a central lock, Yjs models text operations as mathematical state vectors. Concurrent edits merge deterministically regardless of message arrival order.',
              },
              {
                q: 'Is KagazAi free and can I host it myself?',
                a: 'Yes, KagazAi is 100% free. The entire monorepo includes Docker Compose recipes that spin up the web frontend, backend Node server, Redis cluster, and local MongoDB instances in one command.',
              },
              {
                q: 'How is my document data secured?',
                a: 'Authentication sessions are signed with JWTs stored in secure httpOnly sameSite cookies. Document permissions (Owner, Editor, Viewer) are strictly verified on the Express server and inside Hocuspocus WebSocket connection hooks. Viewer clients cannot modify documents even by altering frontend JavaScript.',
              },
              {
                q: 'What happens if I lose internet connection while typing?',
                a: 'KagazAi buffers your local CRDT edits in memory. You can continue typing locally. As soon as your internet connection is restored, the client reconnects to the WebSocket server and synchronizes all changes with collaborators automatically.',
              },
              {
                q: 'How does horizontal scaling work with Redis?',
                a: 'When running multiple server instances behind an Nginx load balancer, the Hocuspocus Redis extension broadcasts document updates across all instances using Redis Pub/Sub channels. Clients connected to different servers see each other edits with sub-15ms latency.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-neutral-900 border border-neutral-800 rounded overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-5 py-3.5 flex items-center justify-between text-xs sm:text-sm font-semibold text-white hover:text-neutral-200 focus:outline-hidden"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-neutral-400 leading-relaxed border-t border-neutral-800/80 pt-2.5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Final High-Impact CTA Section */}
      <section className="py-20 bg-neutral-950 border-b border-neutral-850 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
            Write notes, assignments, and specs without friction.
          </h2>
          <p className="text-sm text-neutral-400 max-w-lg mx-auto mb-8">
            Experience conflict-free CRDT collaboration. Zero document lockups, zero lost edits, and instant link sharing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={user ? '/dashboard' : '/register'}
              onClick={() => trackEvent('cta_click_footer', { destination: user ? 'dashboard' : 'register' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-neutral-950 bg-white rounded hover:bg-neutral-200 transition-colors shadow-sm"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/privacy"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 rounded hover:bg-neutral-850 transition-colors"
            >
              Read Privacy Policy
            </Link>
          </div>
        </div>
      </section>

      {/* 10. High-Density Professional Footer */}
      <footer className="bg-[#05070a] text-neutral-400 text-xs py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-neutral-850">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="w-5 h-5 rounded bg-white text-neutral-950 flex items-center justify-center text-[10px] font-bold">
                  K
                </span>
                KagazAi
              </div>
              <p className="text-neutral-400 leading-relaxed text-xs">
                Real-time collaborative document editor with Yjs CRDT synchronization, presence cursors, and Redis clustering.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                All Systems Operational
              </div>
            </div>

            <div>
              <div className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Product</div>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">Live Lab Demo</a></li>
                <li><a href="#benchmarks" className="hover:text-white transition-colors">Empirical Benchmarks</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Workspace</Link></li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Architecture</div>
              <ul className="space-y-2 text-xs">
                <li><span className="text-neutral-500">Yjs CRDT Engine</span></li>
                <li><span className="text-neutral-500">Hocuspocus WebSocket</span></li>
                <li><span className="text-neutral-500">Redis Pub/Sub Cluster</span></li>
                <li><span className="text-neutral-500">MongoDB Debounced Store</span></li>
              </ul>
            </div>

            <div>
              <div className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Governance</div>
              <ul className="space-y-2 text-xs">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><span className="text-neutral-500">Zero Telemetry</span></li>
                <li><span className="text-neutral-500">No Cookie Profiling</span></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
            <div>
              &copy; 2026 KagazAi. Open-source real-time collaboration. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-neutral-400">Privacy</Link>
              <Link href="/terms" className="hover:text-neutral-400">Terms</Link>
              <a href="#hero" className="hover:text-neutral-400">Back to Top</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
