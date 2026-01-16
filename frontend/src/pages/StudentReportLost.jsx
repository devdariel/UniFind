import { useMemo, useState } from "react";
import { api } from "../api/client";
import { CheckCircle2, Loader2, FilePlus2, AlertTriangle } from "lucide-react";

const CATEGORIES = ["ID_CARD", "KEYS", "LAPTOP", "HEADPHONES", "BOOK", "BAG", "PHONE", "OTHER"];

export default function StudentReportLost() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("OTHER");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState(today);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function resetForm() {
    setTitle("");
    setDescription("");
    setCategory("OTHER");
    setLocation("");
    setEventDate(today);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Basic validation (beginner-friendly)
    if (title.trim().length < 3) return setError("Please enter a clear title (at least 3 characters).");
    if (description.trim().length < 10) return setError("Please add more description (at least 10 characters).");
    if (location.trim().length < 3) return setError("Please enter a location (at least 3 characters).");
    if (!eventDate) return setError("Please choose the date when you lost the item.");

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        eventDate, // backend expects YYYY-MM-DD
      };

      const res = await api.post("/items/lost", payload);

      setSuccess(`Lost item report submitted successfully (Item ID: ${res.data?.id}).`);
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to submit lost item report.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Report Lost Item</h1>
            <p className="mt-1 text-sm text-slate-300">
              Submit details about an item you lost. Admin staff can match it with found items and verify claims.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm text-slate-200">
            <FilePlus2 className="h-4 w-4" />
            Student Report
          </div>
        </div>

        {(error || success) && (
          <div className="mt-4 space-y-3">
            {error && (
              <div className="rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
                <div className="flex items-center gap-2 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              </div>
            )}
            {success && (
              <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  {success}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        <form onSubmit={submit} className="grid grid-cols-1 gap-5 md:grid-cols-12">
          {/* Title */}
          <div className="md:col-span-7">
            <label className="text-sm text-slate-300">Item title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: Black Wallet"
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
            <p className="mt-2 text-xs text-slate-500">Keep it short and identifiable.</p>
          </div>

          {/* Category */}
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
            <p className="mt-2 text-xs text-slate-500">Helps matching with found items.</p>
          </div>

          {/* Description */}
          <div className="md:col-span-12">
            <label className="text-sm text-slate-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Color, brand, unique marks, items inside, etc."
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          {/* Location */}
          <div className="md:col-span-7">
            <label className="text-sm text-slate-300">Last seen location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Example: Campus Library"
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          {/* Date */}
          <div className="md:col-span-5">
            <label className="text-sm text-slate-300">Date lost</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          {/* Buttons */}
          <div className="md:col-span-12 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                resetForm();
              }}
              className="rounded-xl border border-slate-800 px-4 py-2 text-sm hover:bg-slate-900"
            >
              Clear
            </button>

            <button
              disabled={loading}
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-900 hover:opacity-90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus2 className="h-4 w-4" />}
              Submit report
            </button>
          </div>
        </form>
      </div>

      {/* Help card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
        <div className="text-sm font-medium text-slate-200">Tips for faster recovery</div>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
          <li>Mention unique details (stickers, scratches, serial number, contents).</li>
          <li>Use the exact building/area name for location.</li>
          <li>If you find it later, tell staff to archive the report (demo flow).</li>
        </ul>
      </div>
    </div>
  );
}
