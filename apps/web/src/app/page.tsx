export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-md p-6 shadow-xs">
        <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
          KagazAi
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          A real-time collaborative document editor for notes, assignments, and reports.
        </p>
        <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span>Prompt 0: Setup</span>
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Ready
          </span>
        </div>
      </div>
    </main>
  );
}
