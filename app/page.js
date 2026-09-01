"use client";

import Image from "next/image";
import { useRef, useState } from "react";

const REWARD = "free soft drink";

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Stars({ value }) {
  if (!value) return <span className="text-muted">No review on file</span>;
  return (
    <span className="flex items-center justify-end gap-2">
      <span className="tracking-[3px] text-lg leading-none text-chili">
        {"★".repeat(value)}
        <span className="text-line">{"★".repeat(5 - value)}</span>
      </span>
      <span className="font-semibold">{value}/5</span>
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-line py-4 last:border-0">
      <dt className="shrink-0 text-sm text-muted">{label}</dt>
      <dd className="text-right font-medium break-words">{children}</dd>
    </div>
  );
}

export default function Page() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);
  const [busy, setBusy] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const inputRef = useRef(null);

  async function search(e) {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 2) {
      setError("Type at least 2 characters of a name, phone, or email.");
      return;
    }

    setBusy(true);
    setError("");
    setSelected(null);
    setResults(null);

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed.");

      setDemo(Boolean(data.demo));
      setResults(data.contacts);
      if (data.contacts.length === 1) setSelected(data.contacts[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function redeem() {
    if (!selected) return;
    setRedeeming(true);
    setError("");

    try {
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: selected.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save that.");

      setSelected({ ...selected, redeemed: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setRedeeming(false);
    }
  }

  function reset() {
    setQuery("");
    setResults(null);
    setSelected(null);
    setError("");
    inputRef.current?.focus();
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-10 sm:pt-16">
      <header className="flex flex-col items-center text-center">
        <Image src="/logo.png" alt="Caliente Mexican Food" width={104} height={104} priority />
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          Reward desk
        </h1>
        <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
          Find the customer, check their review, hand over the {REWARD}.
        </p>
      </header>

      <form onSubmit={search} className="mt-9 flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, phone, or email"
          autoComplete="off"
          autoFocus
          className="min-w-0 flex-1 rounded-2xl border-2 border-line bg-white px-5 py-4 text-lg font-medium outline-none transition placeholder:font-normal placeholder:text-[#b3a89f] focus:border-chili focus:ring-4 focus:ring-chili/15"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-2xl bg-chili px-8 py-4 text-lg font-semibold text-white transition hover:bg-chili-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:bg-[#d8ccc2]"
        >
          {busy ? "Searching…" : "Search"}
        </button>
      </form>

      {demo && (
        <p className="mt-4 rounded-xl border border-line bg-white px-4 py-3 text-sm text-muted">
          Sample data. Add your GoHighLevel credentials to <code>.env.local</code> to
          search the real CRM. Try &ldquo;vega&rdquo; or &ldquo;danny&rdquo;.
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-chili/25 bg-chili-light px-4 py-3 text-[15px] text-chili-dark">
          {error}
        </p>
      )}

      {/* No search run yet */}
      {!results && !error && (
        <p className="mt-16 text-center text-[15px] leading-relaxed text-muted">
          Ask for the name or number they used on the review.
        </p>
      )}

      {/* Nothing matched */}
      {results?.length === 0 && (
        <p className="mt-10 rounded-2xl border border-line bg-white px-5 py-6 text-center text-[15px] leading-relaxed text-muted">
          No customer matched that. Try their phone number instead, or the name on
          the order.
        </p>
      )}

      {/* Several matched — pick one */}
      {!selected && results?.length > 1 && (
        <section className="mt-8">
          <p className="mb-3 px-1 text-sm text-muted">
            {results.length} customers matched. Pick one.
          </p>
          <ul className="flex flex-col gap-2.5">
            {results.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setSelected(c)}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border-2 border-line bg-white px-5 py-4 text-left transition hover:border-chili"
                >
                  <span>
                    <span className="font-semibold">{c.name}</span>
                    <span className="mt-0.5 block text-sm text-muted">
                      {c.phone || c.email || "No contact details"}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium text-chili">
                    {c.rating ? `${c.rating} ★` : "—"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* The answer */}
      {selected && (
        <section className="mt-8 overflow-hidden rounded-3xl border-2 border-line bg-white shadow-card">
          <div
            className={`px-6 py-6 text-white ${
              selected.redeemed
                ? "bg-ink"
                : selected.rating
                ? "bg-lime"
                : "bg-[#8a8078]"
            }`}
          >
            <p className="text-sm opacity-85">
              {selected.redeemed
                ? "Reward already handed over"
                : selected.rating
                ? "Review on file"
                : "Ask them to scan the code on the bill"}
            </p>
            <h2 className="mt-1 text-2xl font-bold leading-tight tracking-tight sm:text-[28px]">
              {selected.redeemed
                ? "Already redeemed"
                : selected.rating
                ? `Give the ${REWARD}`
                : "No review on file"}
            </h2>
          </div>

          <dl className="px-6 py-2">
            <Field label="Name">{selected.name}</Field>
            <Field label="Phone">
              {selected.phone ? (
                <a href={`tel:${selected.phone}`} className="underline-offset-2 hover:underline">
                  {selected.phone}
                </a>
              ) : (
                "—"
              )}
            </Field>
            <Field label="Email">{selected.email || "—"}</Field>
            <Field label="Rating">
              <Stars value={selected.rating} />
            </Field>
            <Field label="Customer since">{formatDate(selected.createdAt)}</Field>
          </dl>

          <div className="flex flex-col gap-3 px-6 pb-6 pt-2">
            {!selected.redeemed && selected.rating > 0 && (
              <button
                onClick={redeem}
                disabled={redeeming}
                className="w-full rounded-2xl bg-lime px-6 py-5 text-lg font-semibold text-white transition hover:bg-lime-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:bg-[#d8ccc2]"
              >
                {redeeming ? "Saving…" : "Mark drink given"}
              </button>
            )}
            {selected.redeemed && (
              <p className="text-center text-sm text-muted">
                Saved to their contact record. One drink per review.
              </p>
            )}
            <button
              onClick={reset}
              className="py-2 text-[15px] font-medium text-muted underline underline-offset-2"
            >
              New search
            </button>
          </div>
        </section>
      )}

      <footer className="mt-16 border-t border-line pt-6 text-center text-sm text-muted">
        Caliente Mexican Food · 11815 Sorrento Valley Rd, San Diego
      </footer>
    </main>
  );
}
