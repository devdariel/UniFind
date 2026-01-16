import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Search,
  X,
  ShieldCheck,
} from "lucide-react";

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING"); // PENDING / APPROVED / REJECTED / ALL
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(""); // "approve" | "reject"
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    setMsg("");
    try {
      const params = {};
      if (statusFilter !== "ALL") params.status = statusFilter;

      const res = await api.get("/claims", { params });
      setClaims(res.data.claims || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load claims.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return claims;
    return claims.filter((c) => {
      const hay = [
        c.claim_id,
        c.claim_status,
        c.item_id,
        c.item_title,
        c.item_category,
        c.item_location,
        c.student_full_name,
        c.student_email,
        c.proof_text,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(s);
    });
  }, [claims, q]);

  function openModal(claim, which) {
    setSelected(claim);
    setAction(which);
    setNote("");
    setMsg("");
  }

  async function submitDecision() {
    if (!selected) return;
    setBusy(true);
    setMsg("");
    try {
      if (action === "approve") {
        await api.patch(`/claims/${selected.claim_id}/approve`, {
          adminNote: note.trim(),
        });
        setMsg("✅ Claim approved. Item should now be CLAIMED.");
      } else {
        await api.patch(`/claims/${selected.claim_id}/reject`, {
          adminNote: note.trim(),
        });
        setMsg("✅ Claim rejected.");
      }
      await load();
      setSelected(null);
      setAction("");
    } catch (e) {
      setMsg(e?.response?.data?.error || "Action failed.");
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
            <h1 className="text-2xl font-semibold tracking-tight">Claims Review</h1>
            <p className="mt-1 text-sm text-slate-300">
              Review student claims, verify proof, and approve or reject. Approving will mark the item as <b>CLAIMED</b>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
              <ShieldCheck className="h-4 w-4" />
              Admin only
            </span>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm hover:bg-slate-900"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-3">
            <label className="text-xs text-slate-400">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-2 text-sm outline-none focus:border-slate-500"
            >
              <option value="PENDING" className="bg-slate-950">PENDING</option>
              <option value="APPROVED" className="bg-slate-950">APPROVED</option>
              <option value="REJECTED" className="bg-slate-950">REJECTED</option>
              <option value="ALL" className="bg-slate-950">ALL</option>
            </select>
          </div>

          <div className="md:col-span-9">
            <label className="text-xs text-slate-400">Search</label>
            <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by student, item, location, proof text…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="rounded-lg p-1 hover:bg-slate-900"
                  aria-label="Clear"
                >
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
            Showing <span className="text-slate-100 font-medium">{filtered.length}</span> claim(s)
          </div>
          <StatusPill status={statusFilter} />
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-lg font-semibold">No claims found</div>
            <div className="mt-2 text-sm text-slate-300">
              Try changing filters, or create a student claim to test the workflow.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-slate-300">
                <tr className="border-b border-slate-800">
                  <th className="px-6 py-3 text-left font-medium">Claim</th>
                  <th className="px-6 py-3 text-left font-medium">Student</th>
                  <th className="px-6 py-3 text-left font-medium">Item</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.claim_id} className="border-b border-slate-800/60 hover:bg-slate-900/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-100">#{c.claim_id}</div>
                      <div className="text-xs text-slate-400">Created: {formatDateTime(c.created_at)}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-100">{c.student_full_name}</div>
                      <div className="text-xs text-slate-400">{c.student_email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-100">{c.item_title}</div>

                      <div className="text-sm font-semibold text-slate-100">
                        {c.title}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        <span className="text-slate-300">Category:</span>{" "}
                        {(c.category || "OTHER").replaceAll("_", " ")}
                        <span className="mx-2 text-slate-600">|</span>
                        <span className="text-slate-300">Location:</span>{" "}
                        {c.location || "-"}
                      </div> 

                      <button
                        onClick={() => openModal(c, "view")}
                        className="mt-2 text-xs text-slate-200 underline decoration-slate-700 underline-offset-4 hover:text-white"
                      >
                        View proof
                      </button>
                    </td>

                    <td className="px-6 py-4">
                      <ClaimStatusBadge status={c.claim_status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      {c.claim_status === "PENDING" ? (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openModal(c, "reject")}
                            className="rounded-xl border border-slate-800 px-3 py-2 text-xs hover:bg-slate-900"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => openModal(c, "approve")}
                            className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-900 hover:opacity-90"
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400">No actions</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 p-5">
              <div>
                <div className="text-sm text-slate-400">Claim #{selected.claim_id}</div>
                <div className="text-lg font-semibold">{selected.item_title}</div>
                <div className="mt-1 text-sm text-slate-300">
                  Student: <span className="text-slate-200">{selected.student_full_name}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelected(null);
                  setAction("");
                  setMsg("");
                }}
                className="rounded-xl border border-slate-800 p-2 hover:bg-slate-900"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="text-xs text-slate-400">Proof text</div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                  {selected.proof_text || "No proof text provided."}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Info label="Item ID" value={selected.item_id} />
                <Info label="Claim status" value={selected.claim_status} />
                <Info label="Category" value={selected.item_category?.replaceAll("_", " ")} />
                <Info label="Location" value={selected.item_location} />
              </div>

              {(action === "approve" || action === "reject") && (
                <div>
                  <label className="text-sm text-slate-300">Admin note (optional)</label>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Example: Proof matches serial number."
                    className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />
                </div>
              )}

              {msg && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-200">
                  {msg}
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => {
                    setSelected(null);
                    setAction("");
                    setMsg("");
                  }}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-900"
                >
                  Close
                </button>

                {selected.claim_status === "PENDING" && (
                  <>
                    <button
                      onClick={() => setAction("reject")}
                      className={`rounded-xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-900 ${
                        action === "reject" ? "bg-slate-900" : ""
                      }`}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setAction("approve")}
                      className={`rounded-xl px-4 py-2 text-sm font-medium ${
                        action === "approve"
                          ? "bg-slate-100 text-slate-900"
                          : "bg-slate-100/80 text-slate-900 hover:opacity-90"
                      }`}
                    >
                      Approve
                    </button>

                    {(action === "approve" || action === "reject") && (
                      <button
                        disabled={busy}
                        onClick={submitDecision}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:opacity-90 disabled:opacity-60"
                      >
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : action === "approve" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        Confirm {action}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Small UI helpers ---------- */

function ClaimStatusBadge({ status }) {
  const base = "inline-flex items-center rounded-full border px-3 py-1 text-xs";
  if (status === "PENDING") return <span className={`${base} border-amber-800/60 bg-amber-950/40 text-amber-200`}>PENDING</span>;
  if (status === "APPROVED") return <span className={`${base} border-emerald-800/60 bg-emerald-950/40 text-emerald-200`}>APPROVED</span>;
  if (status === "REJECTED") return <span className={`${base} border-red-800/60 bg-red-950/40 text-red-200`}>REJECTED</span>;
  return <span className={`${base} border-slate-700 bg-slate-950/40 text-slate-200`}>{status}</span>;
}

function StatusPill({ status }) {
  return (
    <span className="rounded-full border border-slate-800 bg-slate-950/40 px-3 py-1 text-xs text-slate-200">
      {status === "ALL" ? "All statuses" : status}
    </span>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-100">{value ?? "-"}</div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="p-6 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-slate-800/40" />
      ))}
    </div>
  );
}

function formatDateTime(v) {
  if (!v) return "-";
  try {
    const d = new Date(v);
    return d.toLocaleString();
  } catch {
    return String(v);
  }
}

