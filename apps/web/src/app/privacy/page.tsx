import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, Lock, Cookie, Database, Mail } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - KagazAi',
  description: 'Plain-language privacy policy explaining how KagazAi handles user accounts, documents, and cookies.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 rounded px-1.5 py-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to KagazAi</span>
          </Link>
          <span className="text-xs text-neutral-500 font-mono">Last updated: October 2026</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full">
        {/* Student Review Advisory Banner */}
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-900">
          <p className="font-semibold mb-1">Portfolio Project Notice &amp; Legal Draft Disclaimer</p>
          <p className="text-xs text-amber-800 leading-relaxed">
            This document is a technical draft reflecting how KagazAi handles data in its current portfolio architecture. It does not constitute formal legal counsel. Before deploying KagazAi to public production, review the bracketed information below (such as your domain, maintainer email, and legal jurisdiction).
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-md p-6 sm:p-10 shadow-xs">
          <div className="flex items-center gap-3 pb-6 border-b border-neutral-200">
            <div className="w-10 h-10 rounded-md bg-neutral-900 flex items-center justify-center text-white shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Privacy Policy</h1>
              <p className="text-xs text-neutral-500 mt-0.5">Plain-language transparency on data collection and storage</p>
            </div>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-neutral-700">
            <section>
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-neutral-600" />
                1. Overview
              </h2>
              <p>
                KagazAi is a real-time collaborative document editor designed for students and small teams. We believe in minimal data collection. We collect only what is strictly required to authenticate your identity, synchronize your documents in real time, and preserve your document revisions.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-neutral-600" />
                2. Information We Collect
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Account Details:</strong> When you register an account, we collect your display name, email address, and a salted password hash. We never store plain text passwords; all passwords are cryptographically hashed using bcrypt.
                </li>
                <li>
                  <strong>Document Content:</strong> Text entered into KagazAi documents is stored as collaborative CRDT state vectors and binary snapshots in MongoDB, along with an unformatted plain-text representation used for index searches.
                </li>
                <li>
                  <strong>Collaboration Activity:</strong> When actively editing a document, temporary ephemeral presence updates (including your cursor coordinate, active selection, and display name) are broadcast via WebSockets to other active collaborators in the same room. These ephemeral presence vectors are held in memory and are discarded when you disconnect.
                </li>
                <li>
                  <strong>Comments &amp; Versions:</strong> Explicit comments and named snapshot milestones created on documents are saved with your user identifier and timestamp.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-3">
                <Cookie className="w-4 h-4 text-neutral-600" />
                3. Cookies and Storage
              </h2>
              <p className="mb-2">
                KagazAi uses a single session cookie named <code className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs font-mono">token</code>:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-600">
                <li>Configured with the <code className="font-mono">httpOnly</code> flag so client-side JavaScript cannot read or exfiltrate the token.</li>
                <li>Configured with <code className="font-mono">SameSite=Lax</code> to protect against cross-site request forgery (CSRF) attacks.</li>
                <li>Transmitted over encrypted HTTPS connections in production with the <code className="font-mono">secure</code> attribute enabled.</li>
              </ul>
              <p className="mt-3">
                We do not use advertising cookies, tracking pixels, or third-party behavioral analytics scripts.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-neutral-600" />
                4. Data Storage and Access Control
              </h2>
              <p>
                All data is stored in our protected database clusters. Access permissions (Owner, Editor, Viewer) are enforced strictly on the server:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-neutral-600">
                <li>Only authenticated users who have explicit role grants can access document WebSocket rooms.</li>
                <li>Viewers are restricted to read-only sockets at the protocol level.</li>
                <li>When a document is deleted by its owner, the document record, associated versions, comments, and permission records are permanently removed.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-neutral-600" />
                5. Student and Maintainer Review Checklist
              </h2>
              <p className="mb-2 text-xs">
                Before publishing to production, the project maintainer should configure the following details:
              </p>
              <div className="p-3 bg-neutral-100 rounded text-xs font-mono space-y-1 text-neutral-800">
                <div>[Maintainer Contact]: support@kagazai.app (or your portfolio email)</div>
                <div>[Hosting Provider]: Self-hosted VPS / Docker / Cloud Provider</div>
                <div>[Governing Jurisdiction]: Insert your home state/country</div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span>KagazAi Collab Editor</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-neutral-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="/dashboard" className="hover:text-neutral-900 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
