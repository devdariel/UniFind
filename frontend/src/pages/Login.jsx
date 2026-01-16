import { useState } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("admin@unifind.test");
  const [password, setPassword] = useState("Test1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(res.data.user.role === "ADMIN" ? "/admin" : "/student/found");
    } catch (err) {
      setError(err?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome to UniFind
          </h1>
          <p className="mt-2 text-slate-300">
            A modern lost & found system with role-based access, claims
            verification, and full audit history.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
            <div className="font-medium text-slate-200">Demo accounts</div>
            <div className="mt-2 space-y-1">
              <div>
                <span className="text-slate-400">Admin:</span>{" "}
                admin@unifind.test / Test1234
              </div>
              <div>
                <span className="text-slate-400">Student:</span>{" "}
                dariel@student.test / Test1234
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 shadow-xl">
          <h2 className="text-xl font-semibold">Sign in</h2>
          <p className="mt-1 text-sm text-slate-400">
            Use your role to access the correct dashboard.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 outline-none focus:border-slate-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Password</label>
              <input
                type="password"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 outline-none focus:border-slate-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-slate-100 px-4 py-3 font-medium text-slate-900 hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
