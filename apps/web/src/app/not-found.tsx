import React from 'react';
import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-16 text-center select-none">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-lg p-8 shadow-xs">
        <div className="w-12 h-12 rounded-md bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto mb-4 text-neutral-700">
          <FileQuestion className="w-6 h-6 text-neutral-800" />
        </div>

        <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-1 block">
          404 Error
        </span>

        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Document Not Found
        </h1>

        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
          The document or page you requested does not exist, was moved, or you may need permission from the owner to view it.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
          >
            <Home className="w-4 h-4" />
            Landing Page
          </Link>
        </div>
      </div>

      <div className="mt-8 text-xs text-neutral-400">
        KagazAi Collaborative Editor &middot; Error Code 404
      </div>
    </div>
  );
}
