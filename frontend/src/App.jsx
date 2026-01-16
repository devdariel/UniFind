export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
        <h1 className="text-3xl font-semibold tracking-tight">UniFind</h1>
        <p className="mt-2 text-slate-300">Modern UI foundation ✅</p>
        <div className="mt-6 flex gap-3">
          <button className="rounded-xl bg-slate-100 px-4 py-2 text-slate-900 font-medium hover:opacity-90">
            Primary
          </button>
          <button className="rounded-xl border border-slate-700 px-4 py-2 text-slate-100 hover:bg-slate-900">
            Secondary
          </button>
        </div>
      </div>
    </div>
  );
}
