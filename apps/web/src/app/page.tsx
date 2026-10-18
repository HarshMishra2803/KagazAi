'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon, ArrowRight, Loader2, FileText } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      {/* Top Navigation */}
      <header className="w-full border-b border-neutral-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-neutral-900">
              KagazAi
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Checking session...</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {loading ? (
            <div className="bg-white border border-neutral-200 rounded-md p-8 text-center shadow-xs">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-400 mx-auto" />
              <p className="mt-3 text-sm text-neutral-600">Verifying session...</p>
            </div>
          ) : user ? (
            <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-xs text-center">
              <p className="text-xs text-neutral-500">Redirecting to your dashboard...</p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-md p-8 shadow-xs">
              <span className="inline-block text-xs font-semibold tracking-wider uppercase text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded">
                Collaborative Editor
              </span>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900">
                KagazAi
              </h1>
              <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                A real-time collaborative document editor for notes, assignments, and reports.
              </p>

              <div className="mt-6 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Create account</span>
                </Link>
                <Link
                  href="/login"
                  className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
                >
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
