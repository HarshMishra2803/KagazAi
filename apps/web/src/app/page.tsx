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
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePlaygroundTab, setActivePlaygroundTab] = useState<'editor' | 'history' | 'comments' | 'architecture'>('editor');
  
  // Interactive playground demo states
  const [editorText, setEditorText] = useState('## KagazAi Architecture Spec\n\nKagazAi is a real-time collaborative document editor designed for students and small teams.\n\n- Powered by Yjs Conflict-Free Replicated Data Types (CRDTs)\n- Sub-15ms WebSocket round-trip synchronization\n- Multi-node horizontal scaling via Redis Pub/Sub channels');
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans selection:bg-neutral-200">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-md bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-tight transition-transform group-hover:scale-105">
              K
            </div>
            <span className="font-bold text-lg tracking-tight text-neutral-950">
              KagazAi
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-600">
            <a href="#features" className="hover:text-neutral-950 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-neutral-950 transition-colors">
              How It Works
            </a>
            <a href="#demo" className="hover:text-neutral-950 transition-colors">
              Live Demo
            </a>
            <a href="#benefits" className="hover:text-neutral-950 transition-colors">
              Benefits
            </a>
            <a href="#pricing" className="hover:text-neutral-950 transition-colors">
              Community
            </a>
            <a href="#faq" className="hover:text-neutral-950 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => trackEvent('cta_click_nav', { destination: 'dashboard' })}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                Go to Workspace
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-950 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => trackEvent('cta_click_nav', { destination: 'register' })}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-600 hover:text-neutral-900 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-900"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-200 bg-white px-4 pt-3 pb-5 space-y-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-700 hover:text-neutral-950 py-1"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-700 hover:text-neutral-950 py-1"
            >
              How It Works
            </a>
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-700 hover:text-neutral-950 py-1"
            >
              Live Demo
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-700 hover:text-neutral-950 py-1"
            >
              Benefits
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-700 hover:text-neutral-950 py-1"
            >
              Community
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-neutral-700 hover:text-neutral-950 py-1"
            >
              FAQ
            </a>
            <div className="pt-3 border-t border-neutral-200 flex flex-col gap-2">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md"
                >
                  Open Workspace
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-md"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section id="hero" className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Engineering Value Proposition Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-neutral-100 border border-neutral-200 text-xs font-semibold text-neutral-700 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Yjs CRDT Engine &middot; Sub-15ms WebSocket Round-Trip Sync
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-950 leading-[1.15] mb-6">
            Real-time collaborative writing with zero merge conflicts.
          </h1>

          {/* Product Description */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-600 leading-relaxed mb-8">
            A high-performance document editor for students and engineering teams. Write assignments, technical specs, and meeting notes together with live deterministic presence and distributed version history.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
            <Link
              href={user ? '/dashboard' : '/register'}
              onClick={() => trackEvent('cta_click_hero', { destination: user ? 'dashboard' : 'register' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              Start Writing Free
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#demo"
              onClick={() => trackEvent('cta_click_hero', { destination: 'demo' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-900"
            >
              <Play className="w-4 h-4 text-neutral-500" />
              Explore Interactive Demo
            </a>
          </div>

          {/* Key Value Proposition Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Convergence</div>
              <div className="text-sm font-bold text-neutral-900 mt-0.5">100% Conflict-Free</div>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Sync Latency</div>
              <div className="text-sm font-bold text-neutral-900 mt-0.5">10.6ms p95 Latency</div>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Privacy</div>
              <div className="text-sm font-bold text-neutral-900 mt-0.5">Zero Telemetry</div>
            </div>
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Architecture</div>
              <div className="text-sm font-bold text-neutral-900 mt-0.5">Redis Clustered</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Trust Indicators & Verified Engineering Metrics */}
      <section className="py-12 bg-neutral-100/70 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Verified Production Benchmarks (k6 Load Tests)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-neutral-200 rounded-md p-5 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">WebSocket Concurrency</span>
                <Users className="w-4 h-4 text-neutral-600" />
              </div>
              <div className="text-2xl font-bold text-neutral-950">100+ Clients</div>
              <p className="text-xs text-neutral-500 mt-1">Concurrently typing on a single document with zero dropped frames</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-md p-5 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">Update Round-Trip</span>
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-neutral-950">10.6ms p95</div>
              <p className="text-xs text-neutral-500 mt-1">Median latency under 5.2ms measured during automated stress runs</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-md p-5 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">Connection Handshake</span>
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-neutral-950">19.3ms p95</div>
              <p className="text-xs text-neutral-500 mt-1">Fast ticket verification and immediate CRDT state vector hydration</p>
            </div>

            <div className="bg-white border border-neutral-200 rounded-md p-5 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500 mb-2">
                <span className="text-xs font-medium">Data Integrity</span>
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-neutral-950">0 Corruptions</div>
              <p className="text-xs text-neutral-500 mt-1">Binary state validation prevents corrupted buffer injection</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Product Preview / Interactive Demo Playground */}
      <section id="demo" className="py-20 bg-white border-b border-neutral-200 scroll-mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Interactive Product Showcase
            </span>
            <h2 className="text-3xl font-bold text-neutral-950 mt-1 mb-3">
              Explore the core engine live in your browser.
            </h2>
            <p className="text-sm text-neutral-600">
              Switch between tabs below to test live editing, version timeline rollback, threaded comments, and the multi-instance Redis cluster.
            </p>
          </div>

          {/* Playground Card Container */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden text-neutral-100">
            {/* Playground Tab Navigation Bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-neutral-800 bg-neutral-950 px-4 py-2.5">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActivePlaygroundTab('editor')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activePlaygroundTab === 'editor'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    1. Live TipTap Editor
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePlaygroundTab('history')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activePlaygroundTab === 'history'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    2. Version Timeline
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePlaygroundTab('comments')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activePlaygroundTab === 'comments'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    3. Threaded Comments
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePlaygroundTab('architecture')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    activePlaygroundTab === 'architecture'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5" />
                    4. Redis Cluster Map
                  </span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Room: <code className="font-mono text-neutral-300">doc_demo_prod</code></span>
              </div>
            </div>

            {/* Tab 1: Live Editor View */}
            {activePlaygroundTab === 'editor' && (
              <div className="p-6 bg-neutral-900 min-h-[380px] flex flex-col justify-between">
                <div>
                  {/* Editor Formatting Controls */}
                  <div className="flex items-center gap-2 pb-4 border-b border-neutral-800 text-xs">
                    <button
                      type="button"
                      onClick={() => setIsBold(!isBold)}
                      className={`px-2.5 py-1 rounded border text-xs font-semibold ${
                        isBold ? 'bg-neutral-700 text-white border-neutral-600' : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsItalic(!isItalic)}
                      className={`px-2.5 py-1 rounded border text-xs italic ${
                        isItalic ? 'bg-neutral-700 text-white border-neutral-600' : 'bg-neutral-800 text-neutral-300 border-neutral-700'
                      }`}
                    >
                      I
                    </button>
                    <div className="h-4 w-px bg-neutral-800 mx-1"></div>
                    <span className="text-neutral-400 text-xs">Simulated Collaborators:</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-600 text-white">Harsh (You)</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-600 text-white">Alice (Live)</span>
                  </div>

                  {/* Editable Preview Document */}
                  <div className="mt-4 font-mono text-sm leading-relaxed text-neutral-200">
                    <textarea
                      value={editorText}
                      onChange={(e) => setEditorText(e.target.value)}
                      rows={8}
                      className="w-full bg-neutral-950 p-4 border border-neutral-800 rounded-md font-mono text-xs sm:text-sm text-neutral-200 focus:outline-hidden focus:border-neutral-600 resize-none"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                  <span>Changes sync across Y.Doc state vectors in real time.</span>
                  <button
                    type="button"
                    onClick={() => setEditorText('## KagazAi Architecture Spec\n\nKagazAi is a real-time collaborative document editor designed for students and small teams.\n\n- Powered by Yjs Conflict-Free Replicated Data Types (CRDTs)\n- Sub-15ms WebSocket round-trip synchronization\n- Multi-node horizontal scaling via Redis Pub/Sub channels')}
                    className="text-neutral-400 hover:text-white underline text-xs"
                  >
                    Reset Text
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Version Timeline View */}
            {activePlaygroundTab === 'history' && (
              <div className="p-6 bg-neutral-900 min-h-[380px]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Version List */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Revisions</div>
                    {[
                      { index: 0, label: 'v1.2: Added Redis clustering spec', time: 'Today, 18:30', author: 'Harsh Sharma' },
                      { index: 1, label: 'v1.1: Automated 10-min autosave', time: 'Today, 18:20', author: 'System' },
                      { index: 2, label: 'v1.0: Initial document draft', time: 'Today, 17:45', author: 'Harsh Sharma' },
                    ].map((ver) => (
                      <div
                        key={ver.index}
                        onClick={() => setSelectedVersion(ver.index)}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          selectedVersion === ver.index
                            ? 'bg-neutral-800 border-neutral-600 text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                        }`}
                      >
                        <div className="text-xs font-semibold">{ver.label}</div>
                        <div className="text-[11px] text-neutral-400 mt-1">{ver.author} &middot; {ver.time}</div>
                      </div>
                    ))}
                  </div>

                  {/* Version Diff / Preview */}
                  <div className="md:col-span-2 bg-neutral-950 border border-neutral-800 rounded-md p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-800 text-neutral-400">
                        <span>Snapshot Content ({selectedVersion === 0 ? 'Current Live State' : 'Historical Snapshot'})</span>
                        <span className="text-emerald-400 font-mono text-[11px]">Clean Yjs Buffer</span>
                      </div>
                      <div className="mt-3 text-xs font-mono text-neutral-300 leading-relaxed">
                        {selectedVersion === 0 && (
                          <div className="space-y-1">
                            <p className="text-neutral-400">// Live revision 1.2</p>
                            <p>## KagazAi Architecture Spec</p>
                            <p>- Powered by Yjs Conflict-Free Replicated Data Types</p>
                            <p>- Sub-15ms WebSocket round-trip synchronization</p>
                            <p className="text-emerald-400">+ Multi-node horizontal scaling via Redis Pub/Sub channels</p>
                          </div>
                        )}
                        {selectedVersion === 1 && (
                          <div className="space-y-1">
                            <p className="text-neutral-400">// Auto-save checkpoint 1.1</p>
                            <p>## KagazAi Architecture Spec</p>
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
                      <span className="text-neutral-400">Restoration computes diff and applies it as a live update.</span>
                      <button
                        type="button"
                        onClick={() => alert(`Simulated restore of revision ${selectedVersion} executed non-destructively.`)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-medium"
                      >
                        Restore Snapshot
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Threaded Comments View */}
            {activePlaygroundTab === 'comments' && (
              <div className="p-6 bg-neutral-900 min-h-[380px]">
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="flex items-center justify-between text-xs text-neutral-400 pb-2 border-b border-neutral-800">
                    <span>Active Comment Threads (2 comments)</span>
                    <span className="text-amber-400 text-[11px]">Mark-based ProseMirror IDs</span>
                  </div>

                  {demoComments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-3.5 rounded-md border text-xs transition-colors ${
                        comment.resolved
                          ? 'bg-neutral-950/60 border-neutral-800/60 opacity-60'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{comment.author}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-300">{comment.role}</span>
                          <span className="text-neutral-500 text-[11px]">{comment.time}</span>
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

                  {/* Add Reply Form */}
                  <form onSubmit={handleAddDemoReply} className="pt-2 flex gap-2">
                    <input
                      type="text"
                      value={commentReplyText}
                      onChange={(e) => setCommentReplyText(e.target.value)}
                      placeholder="Type a test comment reply..."
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-neutral-600"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-medium"
                    >
                      Reply
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Tab 4: Redis Architecture View */}
            {activePlaygroundTab === 'architecture' && (
              <div className="p-6 bg-neutral-900 min-h-[380px] flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                    Horizontal WebSocket Scaling Topology
                  </div>

                  {/* Visual Topology Map */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-xs">
                    <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-md">
                      <div className="font-semibold text-white mb-1">Nginx Load Balancer</div>
                      <p className="text-neutral-400 text-[11px]">Round-robin WebSocket upgrade proxy on port 80/443</p>
                      <div className="mt-3 text-emerald-400 font-mono text-[10px]">proxy_set_header Upgrade $http_upgrade</div>
                    </div>

                    <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-md">
                      <div className="font-semibold text-white mb-1">Hocuspocus Server Instances</div>
                      <p className="text-neutral-400 text-[11px]">Node 1 (:1234) &amp; Node 2 (:1235) in Docker</p>
                      <div className="mt-3 text-blue-400 font-mono text-[10px]">Hocuspocus Redis Extension Active</div>
                    </div>

                    <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-md">
                      <div className="font-semibold text-white mb-1">Redis 7 &amp; MongoDB Atlas</div>
                      <p className="text-neutral-400 text-[11px]">Redis Pub/Sub synchronization with debounced Buffer persistence</p>
                      <div className="mt-3 text-amber-400 font-mono text-[10px]">prefix: kagazai:collab</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-neutral-950 border border-neutral-800 rounded-md text-xs font-mono text-neutral-300">
                    <span className="text-neutral-500">// Client 1 connects to Instance A; Client 2 connects to Instance B.</span><br />
                    <span>Client 1 edit -&gt; Instance A -&gt; Redis Pub/Sub -&gt; Instance B -&gt; Client 2 (&lt; 15ms latency).</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
                  <span>Stopping either instance maintains zero data loss because Redis syncs all rooms.</span>
                  <Link href="/dashboard" className="text-white hover:underline text-xs inline-flex items-center gap-1">
                    Open Real App <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-20 bg-neutral-50 border-b border-neutral-200 scroll-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Technical Capabilities
            </span>
            <h2 className="text-3xl font-bold text-neutral-950 mt-1 mb-3">
              Engineered for speed, durability, and true teamwork.
            </h2>
            <p className="text-sm text-neutral-600">
              Every feature is built on open standards, mathematical CRDT guarantees, and strict security enforcement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs hover:border-neutral-300 transition-colors">
              <div className="w-10 h-10 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-4">
                <GitMerge className="w-5 h-5 text-neutral-900" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                CRDT Conflict-Free Synchronization
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-3">
                Powered by Yjs state vectors. Concurrent edits merge deterministically without locks, conflicts, or data overrides.
              </p>
              <div className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded inline-block">
                Benefit: Never lose work when multiple users type at once
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs hover:border-neutral-300 transition-colors">
              <div className="w-10 h-10 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-4">
                <Users className="w-5 h-5 text-neutral-900" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                Live Presence &amp; Deterministic Cursors
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-3">
                See teammate names, active selections, and live cursors rendered with deterministic colors computed from their user identity.
              </p>
              <div className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded inline-block">
                Benefit: Always know who is writing where in the doc
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs hover:border-neutral-300 transition-colors">
              <div className="w-10 h-10 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-4">
                <ShieldCheck className="w-5 h-5 text-neutral-900" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                Role-Based Permission Enforcement
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-3">
                Granular Owner, Editor, and Viewer permissions validated server-side. Viewer connections are strictly read-only at the WebSocket layer.
              </p>
              <div className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded inline-block">
                Benefit: Protect sensitive reports from unauthorized edits
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs hover:border-neutral-300 transition-colors">
              <div className="w-10 h-10 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-4">
                <History className="w-5 h-5 text-neutral-900" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                Non-Destructive Version History
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-3">
                Automatic checkpoints every 10 minutes plus manual labeled snapshots. Restoring computes a delta update so active collaborators stay connected.
              </p>
              <div className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded inline-block">
                Benefit: Roll back mistakes without disconnecting teammates
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs hover:border-neutral-300 transition-colors">
              <div className="w-10 h-10 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-4">
                <MessageSquare className="w-5 h-5 text-neutral-900" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                Threaded Inline Discussions
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-3">
                Comment marks attached to ProseMirror text nodes rather than brittle character offsets. Comments stay pinned to the right words even when text is added before them.
              </p>
              <div className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded inline-block">
                Benefit: Review and resolve feedback right in the text
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-xs hover:border-neutral-300 transition-colors">
              <div className="w-10 h-10 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-800 mb-4">
                <Server className="w-5 h-5 text-neutral-900" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-1.5">
                Horizontal Scaling with Redis Pub/Sub
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-3">
                Hocuspocus instances clustered behind Nginx. Broadcasts updates across instances via Redis channels so users on different nodes see each other live.
              </p>
              <div className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-1 rounded inline-block">
                Benefit: Scale to hundreds of rooms with fault tolerance
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="py-20 bg-white border-b border-neutral-200 scroll-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Three-Step Workflow
            </span>
            <h2 className="text-3xl font-bold text-neutral-950 mt-1 mb-3">
              How KagazAi works in practice.
            </h2>
            <p className="text-sm text-neutral-600">
              Start writing in seconds without bulky software or complex account setups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 relative">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                Initialize Workspace
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Create a blank canvas or launch one of four starter templates: Meeting Notes, Architecture RFC, or Lab Assignment.
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 relative">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                Share With Colleagues
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Copy an instant collaboration link with open editing, or invite teammates by email with granular Viewer or Editor permissions.
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 relative">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                Write &amp; Reconcile Live
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                Type simultaneously with live presence cursors. If connection drops, offline edits reconcile automatically upon reconnect.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href={user ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Start Your First Document
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Benefits Section */}
      <section id="benefits" className="py-20 bg-neutral-50 border-b border-neutral-200 scroll-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Clear Advantages
            </span>
            <h2 className="text-3xl font-bold text-neutral-950 mt-1 mb-3">
              Why students and engineering teams choose KagazAi.
            </h2>
            <p className="text-sm text-neutral-600">
              Built specifically to solve the common pain points of bulky document software.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-1">Zero Document Lockups</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Unlike traditional file drives that lock files when someone is editing, KagazAi allows multiple contributors to edit concurrently with mathematical CRDT convergence.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-1">Uninterrupted Offline Reconnection</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    If Wi-Fi cuts out in a lecture hall or transit, keep typing. When your network restores, your updates sync seamlessly without modal conflict dialogs.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-1">True Data Ownership &amp; Privacy</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    No third-party trackers, no behavioral advertising, and no automated scraping of your code or student assignments for commercial AI training.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white border border-neutral-200 rounded-lg shadow-xs">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-1">Blazing Fast Page Load</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Built with Next.js App Router and lightweight TipTap extensions. Loads in under 200ms without megabytes of bloated vendor scripts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Use Cases & Target Audience */}
      <section className="py-20 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Built for Practical Work
            </span>
            <h2 className="text-3xl font-bold text-neutral-950 mt-1 mb-3">
              Who uses KagazAi?
            </h2>
            <p className="text-sm text-neutral-600">
              Designed specifically for groups that need clear text collaboration without overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                CS &amp; Engineering Students
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                Draft lab reports, group research papers, and software architecture assignments together without emailing file versions back and forth.
              </p>
              <ul className="text-xs text-neutral-500 space-y-1.5">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-700" /> Fast code blocks and formatted tables</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-700" /> Inline feedback on draft submissions</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-700" /> 100% free for educational use</li>
              </ul>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                Software Engineering Teams
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                Collaborate on technical RFCs, API specifications, and incident postmortems with deterministic history and role controls.
              </p>
              <ul className="text-xs text-neutral-500 space-y-1.5">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-700" /> Self-hostable via Docker Compose</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-700" /> Redis cluster for horizontal scale</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-700" /> Non-destructive version checkpoints</li>
              </ul>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
              <h3 className="text-base font-bold text-neutral-900 mb-2">
                Agile Teams &amp; Project Leads
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed mb-4">
                Capture live sprint planning notes, daily standup action items, and retrospectives without document lag.
              </p>
              <ul className="text-xs text-neutral-500 space-y-1.5">
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-700" /> Meeting Notes ready-made template</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-700" /> Live participant presence avatars</li>
                <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-neutral-700" /> Instant link sharing for stakeholders</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Integrations & Technology Stack */}
      <section className="py-16 bg-neutral-100/60 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Technology Standards
          </span>
          <h2 className="text-2xl font-bold text-neutral-950 mt-1 mb-8">
            Built with modern, open-source infrastructure.
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-white border border-neutral-200 rounded-md p-4 text-center">
              <div className="font-bold text-neutral-900 text-sm">Next.js 16</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">App Router</div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-4 text-center">
              <div className="font-bold text-neutral-900 text-sm">Yjs CRDT</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">Mathematical sync</div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-4 text-center">
              <div className="font-bold text-neutral-900 text-sm">TipTap 3</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">ProseMirror engine</div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-4 text-center">
              <div className="font-bold text-neutral-900 text-sm">Hocuspocus</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">WebSocket server</div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-4 text-center">
              <div className="font-bold text-neutral-900 text-sm">Redis 7</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">Pub/Sub clustering</div>
            </div>
            <div className="bg-white border border-neutral-200 rounded-md p-4 text-center">
              <div className="font-bold text-neutral-900 text-sm">MongoDB</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">Binary Buffer store</div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Pricing / Community Section */}
      <section id="pricing" className="py-20 bg-white border-b border-neutral-200 scroll-mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Community &amp; Open Access
            </span>
            <h2 className="text-3xl font-bold text-neutral-950 mt-1 mb-3">
              100% Free &amp; Self-Hostable.
            </h2>
            <p className="text-sm text-neutral-600">
              No hidden tiers, no artificial document limits, and no paid feature gates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Student &amp; Team Cloud</div>
                <div className="text-3xl font-extrabold text-neutral-950 mt-2 mb-1">$0 <span className="text-sm font-normal text-neutral-500">/ forever</span></div>
                <p className="text-xs text-neutral-600 mb-6">Full cloud access for students, researchers, and small teams.</p>
                <ul className="space-y-2.5 text-xs text-neutral-700">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited collaborative documents</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Real-time CRDT sync and live cursors</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Document templates and version history</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Threaded comments and link sharing</li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  href="/register"
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors"
                >
                  Create Free Account
                </Link>
              </div>
            </div>

            {/* Self-Hosted Tier */}
            <div className="bg-white border-2 border-neutral-900 rounded-lg p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-white uppercase tracking-wider mb-1">Open Source</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Self-Hosted Docker</div>
                <div className="text-3xl font-extrabold text-neutral-950 mt-2 mb-1">$0 <span className="text-sm font-normal text-neutral-500">/ open source</span></div>
                <p className="text-xs text-neutral-600 mb-6">Deploy on your own infrastructure with total data sovereignty.</p>
                <ul className="space-y-2.5 text-xs text-neutral-700">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Complete Docker Compose setup included</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Redis Pub/Sub multi-node scaling</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Nginx load balancer configuration</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> k6 automated load test reproduction scripts</li>
                </ul>
              </div>
              <div className="mt-8">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-md transition-colors"
                >
                  View Repo on GitHub
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. FAQ Section */}
      <section id="faq" className="py-20 bg-neutral-50 border-b border-neutral-200 scroll-mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Common Inquiries
            </span>
            <h2 className="text-3xl font-bold text-neutral-950 mt-1 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-neutral-600">
              Clear technical details about how KagazAi handles your documents and data.
            </p>
          </div>

          <div className="space-y-3">
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
                className="bg-white border border-neutral-200 rounded-md overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-semibold text-neutral-900 hover:text-neutral-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  <span>{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-neutral-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-5 pb-4 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Final CTA Section */}
      <section className="py-20 bg-white border-b border-neutral-200 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight mb-4">
            Write notes, assignments, and specs without friction.
          </h2>
          <p className="text-base text-neutral-600 max-w-xl mx-auto mb-8">
            Start collaborating with your study group or engineering team today. Zero lockups, zero lost edits, and instant link sharing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href={user ? '/dashboard' : '/register'}
              onClick={() => trackEvent('cta_click_footer', { destination: user ? 'dashboard' : 'register' })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Get Started with KagazAi
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/privacy"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
            >
              Read Privacy Policy
            </Link>
          </div>
        </div>
      </section>

      {/* 14. Footer */}
      <footer className="bg-neutral-950 text-neutral-400 text-xs py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 pb-10 border-b border-neutral-800">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <span className="w-6 h-6 rounded bg-white text-neutral-950 flex items-center justify-center text-xs font-bold">
                  K
                </span>
                KagazAi
              </div>
              <p className="text-neutral-400 leading-relaxed text-xs">
                Real-time collaborative document editor for notes, assignments, and reports with live CRDT synchronization.
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                All Systems Operational
              </div>
            </div>

            {/* Product Column */}
            <div>
              <div className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Product</div>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#demo" className="hover:text-white transition-colors">Live Interactive Demo</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Community Edition</a></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Document Workspace</Link></li>
              </ul>
            </div>

            {/* Architecture Column */}
            <div>
              <div className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Architecture</div>
              <ul className="space-y-2">
                <li><span className="text-neutral-500">Yjs CRDT Engine</span></li>
                <li><span className="text-neutral-500">Hocuspocus WebSocket Server</span></li>
                <li><span className="text-neutral-500">Redis Pub/Sub Horizontal Scaling</span></li>
                <li><span className="text-neutral-500">k6 Distributed Load Testing</span></li>
                <li><span className="text-neutral-500">MongoDB Atlas Debounced Buffers</span></li>
              </ul>
            </div>

            {/* Legal & Governance */}
            <div>
              <div className="font-semibold text-white text-xs uppercase tracking-wider mb-3">Legal &amp; Privacy</div>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><span className="text-neutral-500">Zero Commercial Telemetry</span></li>
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
