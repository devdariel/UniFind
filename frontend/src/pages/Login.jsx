import { useState } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Sparkles,
  Search,
  ClipboardCheck,
  Lock,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email: email.trim(), password });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "ADMIN") nav("/admin");
      else nav("/student/found");
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-14 md:grid-cols-2 md:items-center">
        {/* Left: product intro */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/50 px-4 py-2 text-sm text-slate-200">
            <Sparkles className="h-4 w-4" />
            UniFind • University Lost & Found
          </div>

          <h1 className="text-4xl font-semibold tracking-tight">
            Find what you lost. <span className="text-slate-300">Return what you found.</span>
          </h1>

          <p className="text-base leading-relaxed text-slate-300">
            UniFind is a secure campus platform that helps students report lost items, browse found items, and submit
            verified claims. Staff can review claims and maintain a full audit trail for transparency.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Feature icon={<Search className="h-4 w-4" />} title="Search & filter" desc="Find items fast by category and keywords." />
            <Feature icon={<ClipboardCheck className="h-4 w-4" />} title="Claims workflow" desc="Submit proof. Staff approves or rejects." />
            <Feature icon={<ShieldCheck className="h-4 w-4" />} title="Role-based access" desc="Student & Admin dashboards." />
            <Feature icon={<Lock className="h-4 w-4" />} title="Audit history" desc="Every status change is recorded in the system." />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 text-sm text-slate-300">
            <div className="font-medium text-slate-100">How it works</div>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Students report a lost item or browse found items.</li>
              <li>Students submit a claim with proof to recover an item.</li>
              <li>Admin reviews claims and updates item status with audit logging.</li>
            </ol>
          </div>
        </div>

        {/* Right: login card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/40 p-8 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Sign in</h2>
              <p className="mt-1 text-sm text-slate-300">
                Enter your university account to access the correct dashboard.
              </p>
            </div>
            <div className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
              <ShieldCheck className="h-4 w-4" />
              Secure login
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-medium text-slate-900 hover:opacity-90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Sign in
            </button>

            <div className="text-xs text-slate-500">
              Tip: Use your assigned project accounts during demo. (Don’t display credentials on the login screen.)
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/50">
          {icon}
        </span>
        {title}
      </div>
      <div className="mt-2 text-sm text-slate-300">{desc}</div>
    </div>
  );
}
