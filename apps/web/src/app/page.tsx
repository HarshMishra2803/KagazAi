'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, LogOut, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';

export default function Home() {
  const { user, loading, logout } = useAuth();

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
                <div className="flex items-center gap-2 text-sm text-neutral-700">
                  <span className="w-7 h-7 rounded-md bg-neutral-200 text-neutral-800 font-medium flex items-center justify-center text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline font-medium">{user.name}</span>
                </div>
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
            <div className="bg-white border border-neutral-200 rounded-md p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Authenticated Session Active
                  </span>
                  <h1 className="mt-3 text-xl font-semibold text-neutral-900">
                    Welcome back, {user.name}
                  </h1>
                  <p className="mt-1 text-sm text-neutral-600">
                    Your session is authenticated via an httpOnly, secure, sameSite cookie.
                  </p>
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-md p-4 text-xs space-y-1.5 text-neutral-700">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Account ID:</span>
                  <span className="font-mono text-neutral-900">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Email:</span>
                  <span className="font-medium text-neutral-900">{user.email}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100">
                <span>Prompt 1: Authentication</span>
                <span>Refresh the page to test session persistence</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-neutral-200 rounded-md p-8 shadow-xs">
              <span className="inline-block text-xs font-semibold tracking-wider uppercase text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded">
                Prompt 1
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
