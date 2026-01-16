import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { Search, Filter, Send, X, Loader2 } from "lucide-react";

const CATEGORIES = ["ALL", "ID_CARD", "KEYS", "LAPTOP", "HEADPHONES", "BOOK", "BAG", "PHONE", "OTHER"];

export default function StudentFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("ALL");

  const [claimOpen, setClaimOpen] = useState(false);
  const [claimItem, setClaimItem] = useState(null);
  const [proofText, setProofText] = useState("");
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimMsg, setClaimMsg] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const params = {};
      if (category !== "ALL") params.category = category;
      if (q.trim()) params.q = q.trim();
      const res = await api.get("/items/found", { params });
      setItems(res.data.items || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load found items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const countText = useMemo(() => `${items.length} item${items.length === 1 ? "" : "s"}`, [items.length]);

  function openClaim(item) {
    setClaimMsg("");
    setProofText("");
    setClaimItem(item);
    setClaimOpen(true);
  }

  async function submitClaim() {
    if (!claimItem) return;
    setClaimMsg("");
    setClaimBusy(true);
    try {
      await api.post("/claims", { itemId: claimItem.id, proofText });
      setClaimMsg("Claim submitted successfully. An admin will review it.");
      // optional: refresh list (item stays FOUND until approved)
      // await load();
    } catch (e) {
      setClaimMsg(e?.response?.data?.error || "Failed to submit claim.");
    } finally {
      setClaimBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Browse Found Items</h1>
            <p className="mt-1 text-sm text-slate-300">
              Search and filter items found on campus. Submit a claim with proof to recover your item.
            </p>
          </div>

          <button
            onClick={load}
            className="inline-flex items-center justify-center rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-sm hover:bg-slate-900"
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, description, or location…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="rounded-lg p-1 hover:bg-slate-900"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-slate-300" />
                </button>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-950">
                    {c === "ALL" ? "All categories" : c.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={load}
              className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:opacity-90"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-400">{countText}</div>

        {err && (
          <div className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {err}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonGrid />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((it) => (
            <ItemCard key={it.id} item={it} onClaim={() => openClaim(it)} />
          ))}
        </div>
      )}

      {/* Claim Modal */}
      {claimOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
              <div>
                <div className="text-sm text-slate-400">Submit claim</div>
                <div className="text-lg font-semibold">{claimItem?.title}</div>
                <div className="mt-1 text-sm text-slate-300">
                  Location: <span className="text-slate-200">{claimItem?.location}</span>
                </div>
              </div>
              <button
                onClick={() => setClaimOpen(false)}
                className="rounded-xl border border-slate-800 p-2 hover:bg-slate-900"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <label className="text-sm text-slate-300">Proof / description (recommended)</label>
              <textarea
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                rows={5}
                placeholder="Example: I can describe unique marks, lockscreen wallpaper, serial number, etc."
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-slate-500"
              />

              {claimMsg && (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-200">
                  {claimMsg}
                </div>
              )}

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setClaimOpen(false)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  disabled={claimBusy}
                  onClick={submitClaim}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:opacity-90 disabled:opacity-60"
                >
                  {claimBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, onClaim }) {
  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/40 p-5 hover:bg-slate-900/55 transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400">{(item.category || "OTHER").replaceAll("_", " ")}</div>
          <div className="mt-1 text-lg font-semibold leading-snug">{item.title}</div>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-950/40 px-3 py-1 text-xs text-slate-200">
          FOUND
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-300 line-clamp-3">{item.description}</p>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-slate-400">
          <span className="text-slate-300">Location:</span> {item.location}
        </div>
        <button
          onClick={onClaim}
          className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 hover:opacity-90"
        >
          Claim
        </button>
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="h-4 w-24 rounded bg-slate-800/70" />
          <div className="mt-3 h-6 w-2/3 rounded bg-slate-800/70" />
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-slate-800/70" />
            <div className="h-3 w-5/6 rounded bg-slate-800/70" />
            <div className="h-3 w-4/6 rounded bg-slate-800/70" />
          </div>
          <div className="mt-6 flex justify-between">
            <div className="h-4 w-40 rounded bg-slate-800/70" />
            <div className="h-9 w-20 rounded-xl bg-slate-800/70" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center">
      <div className="text-lg font-semibold">No found items right now</div>
      <div className="mt-2 text-sm text-slate-300">
        When admins register found items, they will appear here. Try refreshing later.
      </div>
    </div>
  );
}