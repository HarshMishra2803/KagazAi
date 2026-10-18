import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, UserCheck, AlertTriangle, Scale, ShieldAlert, KeyRound } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - KagazAi',
  description: 'Plain-language terms of service outlining acceptable use, user ownership, and portfolio project disclaimers.',
};

export default function TermsPage() {
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
            These terms represent an engineering draft for KagazAi as an educational portfolio system. They are not legal advice. If you intend to run this system as a commercial SaaS, retain qualified legal counsel to customize these clauses for your operating jurisdiction.
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-md p-6 sm:p-10 shadow-xs">
          <div className="flex items-center gap-3 pb-6 border-b border-neutral-200">
            <div className="w-10 h-10 rounded-md bg-neutral-900 flex items-center justify-center text-white shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Terms of Service</h1>
              <p className="text-xs text-neutral-500 mt-0.5">Clear terms governing usage and document collaboration</p>
            </div>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-neutral-700">
            <section>
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-neutral-600" />
                1. Acceptance of Terms
              </h2>
              <p>
                By registering for an account or using KagazAi, you agree to comply with these terms. If you do not agree with any part of these terms, please discontinue using the service.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-3">
                <KeyRound className="w-4 h-4 text-neutral-600" />
                2. User Accounts and Security
              </h2>
              <p>
                To create documents and collaborate, you must create an account with a valid email address and password. You are responsible for maintaining the confidentiality of your credentials. Notify us immediately if you suspect unauthorized access to your account.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-3">
                <UserCheck className="w-4 h-4 text-neutral-600" />
                3. Content Ownership and Intellectual Property
              </h2>
              <p>
                You retain complete ownership and all intellectual property rights in the text, documents, and notes you create on KagazAi. We do not claim ownership of any content you create. You grant KagazAi solely the technical license necessary to store, process, synchronize, and display your documents to the collaborators you designate.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-neutral-600" />
                4. Collaborative Access Control and Sharing
              </h2>
              <p>
                KagazAi enforces role-based access control (Owner, Editor, Viewer). The document owner holds exclusive authority to invite collaborators, assign roles, change permissions, or delete the document. Users agree not to attempt bypassing server-enforced role restrictions.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-neutral-600" />
                5. Acceptable Use and Service Limitations
              </h2>
              <p className="mb-2">
                Users agree not to use KagazAi to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-600">
                <li>Upload malware, harmful code, or malicious scripts.</li>
                <li>Attempt to bypass WebSocket authentication or forge collaborative updates.</li>
                <li>Execute denial-of-service attacks or flood the synchronization servers.</li>
                <li>Infringe upon the intellectual property or privacy rights of any third party.</li>
              </ul>
              <p className="mt-3">
                KagazAi is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis as a learning and portfolio platform. While we employ automated CRDT synchronization and debounced persistence, we recommend maintaining external backups of critical assignment and business records.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-neutral-900 flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-neutral-600" />
                6. Student Maintainer Customization Checklist
              </h2>
              <p className="mb-2 text-xs">
                Before deploying for live public usage, review and replace these items:
              </p>
              <div className="p-3 bg-neutral-100 rounded text-xs font-mono space-y-1 text-neutral-800">
                <div>[Maintainer]: KagazAi Open Source Project Maintainers</div>
                <div>[Official Contact]: legal@kagazai.app (or student personal contact)</div>
                <div>[Jurisdiction]: Specify local laws (e.g., California, USA / Delhi, India)</div>
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
            <Link href="/privacy" className="hover:text-neutral-900 transition-colors">
              Privacy Policy
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
