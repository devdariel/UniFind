import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  RefreshCw,
  PlusCircle,
  Loader2,
  Boxes,
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

const CATEGORIES = ["ID_CARD", "KEYS", "LAPTOP", "HEADPHONES", "BOOK", "BAG", "PHONE", "OTHER"];

export default function AdminDashboard() {
  const nav = useNavigate();

  const [items, setItems] = useState([]);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  // Add Found Item form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    setMsg("");
    try {
      const resItems = await api.get("/admin/items");
      const list = resItems.data.items || [];
      setItems(list);

      const resClaims = await api.get("/claims", { params: { status: "PENDING" } });
      setPendingClaimsCount(resClaims.data.count || 0);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = useMemo(() => {
    const total = items.length;
    const lost = items.filter((i) => i.status === "LOST").length;
    const found = items.filter((i) => i.status === "FOUND").length;
    const claimed = items.filter((i) => i.status === "CLAIMED").length;
    const archived = items.filter((i) => i.status === "ARCHIVED").length;
    return { total, lost, found, claimed, archived };
  }, [items]);

  const latest = useMemo(() => {
    const sorted = [...items].sort((a, b) => (b.id || 0) - (a.id || 0));
    return sorted.slice(0, 5);
  }, [items]);

  async function submitFound(e) {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (title.trim().length < 3) return setErr("Please enter a clear title (min 3 chars).");
    if (description.trim().length < 10) return setErr("Please add more description (min 10 chars).");
    if (location.trim().length < 3) return setErr("Please enter a location (min 3 chars).");
    if (!eventDate) return setErr("Please choose an event date.");

    setBusy(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        eventDate,
      };

      const res = await api.post("/items/found", payload);
      setMsg(`✅ Found item registered successfully (Item ID: ${res.data?.id}).`);

      setTitle("");
      setDescription("");
      setCategory("OTHER");
      setLocation("");
      setEventDate(new Date().toISOString().slice(0, 10));

      await load();
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to register found item.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-slate-300">
              Overview of lost & found activity. Register found items, monitor claims, and manage statuses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
              <LayoutDashboard className="h-4 w-4" />
              Staff Panel
            </span>

            <button
              onClick={() => nav("/admin/claims")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm hover:bg-slate-900"
            >
              <ClipboardList className="h-4 w-4" />
              Claims
            </button>

            <button
              onClick={() => nav("/admin/items")}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm hover:bg-slate-900"
            >
              <Boxes className="h-4 w-4" />
              Items
            </button>

            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm hover:bg-slate-900"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {(err || msg) && (
          <div className="mt-4 space-y-3">
            {err && (
              <div className="rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  {err}
                </div>
              </div>
            )}
            {msg && (
              <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  {msg}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <MetricCard icon={<Boxes className="h-4 w-4" />} label="Total items" value={loading ? "…" : metrics.total} />
        <MetricCard label="Lost" value={loading ? "…" : metrics.lost} />
        <MetricCard label="Found" value={loading ? "…" : metrics.found} />
        <MetricCard label="Claimed" value={loading ? "…" : metrics.claimed} />
        <MetricCard
          icon={<ClipboardList className="h-4 w-4" />}
          label="Pending claims"
          value={loading ? "…" : pendingClaimsCount}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Register Found Item */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-400">Staff action</div>
              <h2 className="text-xl font-semibold">Register Found Item</h2>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
              <PlusCircle className="h-4 w-4" />
              Create FOUND
            </div>
          </div>

          <form onSubmit={submitFound} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="md:col-span-7">
              <label className="text-sm text-slate-300">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Silver Keychain"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="md:col-span-5">
              <label className="text-sm text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-slate-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-950">
                    {c.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-12">
              <label className="text-sm text-slate-300">Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Color, brand, unique marks, contents, etc."
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="md:col-span-7">
              <label className="text-sm text-slate-300">Location found</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Example: Main Hall Entrance"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="md:col-span-5">
              <label className="text-sm text-slate-300">Event date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="md:col-span-12 flex justify-end">
              <button
                disabled={busy}
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-900 hover:opacity-90 disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                Register found item
              </button>
            </div>
          </form>
        </div>

        {/* Latest items (CLICKABLE) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
          <div className="text-sm text-slate-400">Recent</div>
          <h2 className="text-xl font-semibold">Latest Items</h2>
          <p className="mt-1 text-sm text-slate-300">
            Click any item to open details + history.
          </p>

          <div className="mt-5 space-y-3">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-slate-800/40" />
                ))}
              </div>
            ) : latest.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
                No items yet. Register a found item to get started.
              </div>
            ) : (
              latest.map((it) => (
                <button
                  key={it.id}
                  onClick={() => nav(`/admin/items?open=${it.id}`)}
                  className="w-full text-left rounded-xl border border-slate-800 bg-slate-950/40 p-4 hover:bg-slate-900/50 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-slate-400">
                        {it.category?.replaceAll("_", " ")} • {it.location}
                      </div>
                      <div className="mt-1 font-semibold">{it.title}</div>
                      <div className="mt-1 text-xs text-slate-400">Item ID: {it.id}</div>
                    </div>
                    <StatusBadge status={it.status} />
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
            Tip: Use <b>Claims Review</b> to approve/reject claims and see statuses update automatically.
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400">{label}</div>
        {icon ? <div className="text-slate-300">{icon}</div> : null}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const base = "rounded-full border px-3 py-1 text-xs";
  if (status === "LOST") return <span className={`${base} border-red-800/60 bg-red-950/40 text-red-200`}>LOST</span>;
  if (status === "FOUND") return <span className={`${base} border-emerald-800/60 bg-emerald-950/40 text-emerald-200`}>FOUND</span>;
  if (status === "CLAIMED") return <span className={`${base} border-indigo-800/60 bg-indigo-950/40 text-indigo-200`}>CLAIMED</span>;
  if (status === "ARCHIVED") return <span className={`${base} border-slate-700 bg-slate-950/40 text-slate-200`}>ARCHIVED</span>;
  return <span className={`${base} border-slate-700 bg-slate-950/40 text-slate-200`}>{status}</span>;
}
