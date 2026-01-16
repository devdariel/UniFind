import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, RefreshCw, X, Loader2, History } from "lucide-react";

const FILTERS = [
  { key: "ALL", label: "All items", endpoint: "/admin/items" },
  { key: "LOST", label: "Lost", endpoint: "/admin/items/lost" },
  { key: "CLAIMED", label: "Claimed", endpoint: "/admin/items/claimed" },
];

export default function AdminItems() {
  const [params] = useSearchParams();

  const [tab, setTab] = useState("ALL");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");

  // drawer state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [hLoading, setHLoading] = useState(false);

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const endpoint = FILTERS.find((f) => f.key === tab)?.endpoint || "/admin/items";
      const res = await api.get(endpoint);
      setItems(res.data.items || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => {
      const hay = [it.id, it.title, it.description, it.category, it.status, it.location]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [items, q]);

  async function openDrawer(item) {
    setSelected(item);
    setOpen(true);
    setHistory([]);
    setHLoading(true);
    try {
      const res = await api.get(`/items/${item.id}/history`);
      setHistory(res.data.history || []);
    } catch {
      setHistory([]);
    } finally {
      setHLoading(false);
    }
  }

  // ✅ Auto-open drawer when coming from dashboard: /admin/items?open=ID
  useEffect(() => {
    const id = Number(params.get("open"));
    if (!id || items.length === 0) return;

    const item = items.find((x) => x.id === id);
    if (item) openDrawer(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Items</h1>
            <p className="mt-1 text-sm text-slate-300">
              Manage all items and view audit history (status changes).
            </p>
          </div>

          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm hover:bg-slate-900"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Tabs + search */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-5">
            <label className="text-xs text-slate-400">Filter</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setTab(f.key)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                    tab === f.key
                      ? "border-slate-200 bg-slate-100 text-slate-900"
                      : "border-slate-800 bg-slate-950/40 text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-7">
            <label className="text-xs text-slate-400">Search</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, category, location, status…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
              {q && (
                <button onClick={() => setQ("")} className="rounded-lg p-1 hover:bg-slate-900" aria-label="Clear">
                  <X className="h-4 w-4 text-slate-300" />
                </button>
              )}
            </div>
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="text-sm text-slate-300">
            Showing <span className="font-medium text-slate-100">{filtered.length}</span> item(s)
          </div>
          <span className="rounded-full border border-slate-800 bg-slate-950/40 px-3 py-1 text-xs text-slate-200">
            {tab}
          </span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-800/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-lg font-semibold">No items</div>
            <div className="mt-2 text-sm text-slate-300">
              Try another filter or create items using Student/Admin flows.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-300">
                <tr className="border-b border-slate-800">
                  <th className="px-6 py-3 text-left font-medium">ID</th>
                  <th className="px-6 py-3 text-left font-medium">Title</th>
                  <th className="px-6 py-3 text-left font-medium">Category</th>
                  <th className="px-6 py-3 text-left font-medium">Location</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => (
                  <tr key={it.id} className="border-b border-slate-800/60 hover:bg-slate-900/50">
                    <td className="px-6 py-4 text-slate-200">#{it.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-100">{it.title}</div>
                      <div className="text-xs text-slate-400 line-clamp-1">{it.description}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-200">{(it.category || "OTHER").replaceAll("_", " ")}</td>
                    <td className="px-6 py-4 text-slate-200">{it.location}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={it.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openDrawer(it)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-2 text-xs hover:bg-slate-900"
                      >
                        <History className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <div className="h-full w-full max-w-xl border-l border-slate-800 bg-slate-950 p-6 overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-slate-400">Item #{selected?.id}</div>
                <div className="text-xl font-semibold">{selected?.title}</div>
                <div className="mt-1 text-sm text-slate-300">{selected?.location}</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Info label="Status" value={selected?.status} />
              <Info label="Category" value={selected?.category?.replaceAll("_", " ")} />
              <Info label="Event date" value={formatDate(selected?.event_date)} />
              <Info label="Created" value={formatDateTime(selected?.created_at)} />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <div className="text-sm font-medium">Description</div>
              <div className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">
                {selected?.description || "-"}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Status history</div>
                {hLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-300" />}
              </div>

              <div className="mt-3 space-y-3">
                {!hLoading && history.length === 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
                    No history found (or failed to load).
                  </div>
                ) : (
                  history.map((h) => (
                    <div key={h.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-slate-100">
                            {h.old_status ? `${h.old_status} → ` : ""}
                            {h.new_status}
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            {formatDateTime(h.changed_at)} • by user #{h.changed_by_user_id ?? "-"}
                          </div>
                        </div>
                        <span className="rounded-full border border-slate-800 bg-slate-950/40 px-3 py-1 text-xs text-slate-200">
                          History
                        </span>
                      </div>
                      {h.change_reason && (
                        <div className="mt-2 text-sm text-slate-300">{h.change_reason}</div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 text-xs text-slate-500">
                This history is your audit trail proof for the technical report.
              </div>
            </div>
          </div>
        </div>
      )}
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

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-100">{value ?? "-"}</div>
    </div>
  );
}

function formatDate(v) {
  if (!v) return "-";
  try {
    return new Date(v).toISOString().slice(0, 10);
  } catch {
    return String(v);
  }
}

function formatDateTime(v) {
  if (!v) return "-";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return String(v);
  }
}
