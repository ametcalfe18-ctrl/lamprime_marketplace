import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, ShoppingCart, Star, ShieldCheck, Sparkles, Leaf, AlertTriangle, CreditCard, Truck, Heart, Filter, ChevronRight, Plus, Minus, X, Coins } from "lucide-react";
import { motion } from "framer-motion";
import { marketplaceItems as originalItems } from "./data/items";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function supabaseRequest(path, { method = "GET", body, token } = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Supabase configuration missing. Check Vercel settings and redeploy.");
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.msg || data.error_description || data.message || data.error || "Account request failed");
    error.databaseCode = data.code;
    throw error;
  }
  return data;
}

function savedCheckoutKeys(storageKey) {
  if (!storageKey) return {};
  try {
    return JSON.parse(sessionStorage.getItem(storageKey) || "{}") || {};
  } catch {
    return {};
  }
}

function localFavorites(userId) {
  try {
    const result = JSON.parse(localStorage.getItem(`luma-prime-favorites-${userId}`) || "[]");
    return Array.isArray(result) ? result : [];
  } catch { return []; }
}


const listingRarities = ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"];

function catalogItem(product, original = {}) {
  const details = product.listing_details || {};
  return {
    subtitle: "", vendor: "", manufacturer: "", description: "", quote: "",
    category: "General", attunement: "—", features: [], tags: [],
    accent: "from-cyan-400 to-fuchsia-500",
    ...original,
    ...details,
    id: product.product_id,
    name: product.product_name,
    price: Number(product.price),
    rarity: original.rarity === "Platinum Curated Artifact Package" && product.rarity === "Artifact" ? original.rarity : product.rarity,
    availability: product.stock_quantity === null ? "Unlimited stock" : product.stock_quantity > 0 ? `${product.stock_quantity} available` : "Sold out"
  };
}

function ListingEditor({ product, original, onSave, onClose }) {
  const [listingId] = useState(() => product?.product_id || `LP-${crypto.randomUUID()}`);
  const [form, setForm] = useState(() => {
    const item = product ? catalogItem(product, original) : {};
    return {
      name: item.name || "", category: item.category || "", subtitle: item.subtitle || "",
      vendor: item.vendor || "", description: item.description || "",
      image: item.image?.startsWith("https://") ? item.image : "",
      rarity: product?.rarity || "Common", price: product ? String(product.price) : "",
      stock: product?.stock_quantity == null ? "" : String(product.stock_quantity),
      approval: product?.requires_dm_approval ?? false, active: product?.is_active ?? true
    };
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const saving = useRef(false);
  const rare = listingRarities.indexOf(form.rarity) >= 2;
  const set = (field, value) => setForm((previous) => ({ ...previous, [field]: value }));

  async function submit(event) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      await onSave({
        listing_id: listingId, expected_updated_at: product?.updated_at || null,
        listing: { ...form, price: Number(form.price), stock: form.stock === "" ? null : Number(form.stock), approval: rare || form.approval }
      });
    } catch (error) {
      setError(error.message);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return (
    <form className={`${accountCard} mt-3 space-y-3`} onSubmit={submit} aria-label={product ? "Edit listing" : "New listing"}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1">Listing name
          <input className={accountInput} value={form.name} onChange={(event) => set("name", event.target.value)} required maxLength={120} />
        </label>
        <label className="grid gap-1">Category
          <input className={accountInput} value={form.category} onChange={(event) => set("category", event.target.value)} maxLength={120} />
        </label>
        <label className="grid gap-1">Tagline
          <input className={accountInput} value={form.subtitle} onChange={(event) => set("subtitle", event.target.value)} maxLength={160} />
        </label>
        <label className="grid gap-1">Vendor
          <input className={accountInput} value={form.vendor} onChange={(event) => set("vendor", event.target.value)} maxLength={120} />
        </label>
        <label className="grid gap-1">Rarity
          <select className={accountInput} value={form.rarity} onChange={(event) => set("rarity", event.target.value)}>
            {listingRarities.map((rarity) => <option key={rarity}>{rarity}</option>)}
          </select>
        </label>
        <label className="grid gap-1">Price in Lumina
          <input className={accountInput} type="number" min="0" max="1000000000" step="1" value={form.price} onChange={(event) => set("price", event.target.value)} required />
        </label>
        <label className="grid gap-1">Available stock
          <input className={accountInput} type="number" min="0" max="1000000" step="1" value={form.stock} onChange={(event) => set("stock", event.target.value)} required={rare} placeholder={rare ? "Enter quantity" : "Blank means unlimited"} />
        </label>
        <label className="grid gap-1">Product image URL
          <input className={accountInput} type="url" maxLength={1200} value={form.image} onChange={(event) => set("image", event.target.value)} placeholder="https://…" />
        </label>
      </div>
      <label className="grid gap-1">Description
        <textarea className={accountInput} rows={4} maxLength={8000} value={form.description} onChange={(event) => set("description", event.target.value)} />
      </label>
      <div className="flex flex-wrap gap-4">
        <label className="flex gap-2"><input type="checkbox" checked={rare || form.approval} disabled={rare} onChange={(event) => set("approval", event.target.checked)} /> Require DM approval</label>
        <label className="flex gap-2"><input type="checkbox" checked={form.active} onChange={(event) => set("active", event.target.checked)} /> Visible in storefront</label>
      </div>
      {error && <p role="alert" className="text-rose-200">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button className={accountButton} disabled={busy}>{busy ? "Saving…" : "Save listing"}</button>
        <button type="button" className={accountButton} onClick={onClose} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}

function WalletAdjustment({ player, onSave, onClose }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const attempt = useRef(null);
  const saving = useRef(false);

  async function submit(event) {
    event.preventDefault();
    if (saving.current) return;
    const change = Number(amount);
    const explanation = reason.trim();
    if (!Number.isSafeInteger(change) || !change || !explanation) {
      setNotice("Enter a nonzero whole amount and a reason.");
      return;
    }
    if (attempt.current?.change !== change || attempt.current?.reason !== explanation) {
      attempt.current = { id: crypto.randomUUID(), change, reason: explanation };
    }
    saving.current = true;
    setBusy(true);
    setNotice("");
    try {
      await onSave({
        target_player: player.player_id, change_amount: change,
        adjustment_reason: explanation, adjustment_id: attempt.current.id
      });
    } catch (error) {
      setNotice(error.message);
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={`${accountCard} mt-3 space-y-3`}>
      <h4 className="font-semibold">Adjust wallet for {player.player_name}</h4>
      <label className="grid gap-1">Lumina change
        <input className={accountInput} type="number" min="-1000000000" max="1000000000" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="100 to add or -100 to deduct" required />
      </label>
      <label className="grid gap-1">Adjustment reason
        <input className={accountInput} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={240} required />
      </label>
      {notice && <p role="alert" className="text-rose-200">{notice}</p>}
      <div className="flex gap-2">
        <button className={accountButton} disabled={busy}>{busy ? "Saving…" : "Save adjustment"}</button>
        <button type="button" className={accountButton} onClick={onClose} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}

function OrderRefund({ order, busy, onRefund }) {
  const [reason, setReason] = useState("");
  const [restore, setRestore] = useState(false);
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-rose-200">Refund purchase</summary>
      <form className="mt-2 space-y-2" onSubmit={(event) => {
        event.preventDefault();
        if (reason.trim() && window.confirm(`Return ${formatCurrency(order.order_total)} to ${order.player_name}'s wallet?`)) {
          onRefund(order.order_id, reason.trim(), restore);
        }
      }}>
        <label className="grid gap-1">Refund reason
          <input className={accountInput} value={reason} onChange={(event) => setReason(event.target.value)} maxLength={240} required />
        </label>
        <label className="flex gap-2"><input type="checkbox" checked={restore} onChange={(event) => setRestore(event.target.checked)} /> Return items to limited stock when the original deduction is recorded</label>
        <button className={accountButton} disabled={busy || !reason.trim()}>Confirm refund</button>
      </form>
    </details>
  );
}

const deliveryLabels = {
  awaiting_delivery: "Awaiting dispatch",
  dispatched: "In transit",
  delivered: "Delivered"
};
const fundingLabels = {
  pending: "Awaiting DM review",
  code_issued: "Code issued",
  redeemed: "Code redeemed",
  declined: "Declined"
};
const accountButton = "rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 disabled:opacity-50";
const accountInput = "w-full rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white";
const accountCard = "rounded-xl border border-white/10 bg-black/25 p-3 text-sm";

function marketplaceRpc(token, name, body = {}) {
  return supabaseRequest(`/rest/v1/rpc/${name}`, { method: "POST", token, body });
}

function useMarketplaceList(load, initialPage = 0) {
  const [page, setPage] = useState(initialPage);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({ rows: [], busy: true, error: "" });
  useEffect(() => {
    let active = true;
    setResult({ rows: [], busy: true, error: "" });
    load(page)
      .then((rows) => { if (active) setResult({ rows, busy: false, error: "" }); })
      .catch((error) => { if (active) setResult({ rows: [], busy: false, error: error.message }); });
    return () => { active = false; };
  }, [load, page, revision]);
  return { ...result, page, setPage, refresh: () => setRevision((value) => value + 1) };
}

function MyOrders({ token }) {
  const load = useCallback((page) => marketplaceRpc(token, "marketplace_my_orders_with_refunds", { page_offset: page * 20 }), [token]);
  const { rows, busy, error, page, setPage, refresh } = useMarketplaceList(load);

  return (
    <section id="my-orders" className="rounded-2xl border border-cyan-300/15 bg-black/30 p-4" aria-labelledby="my-orders-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="my-orders-title" className="text-lg font-bold">My Orders &amp; Deliveries</h3>
        <button type="button" className={accountButton} disabled={busy} onClick={refresh}>Refresh orders</button>
      </div>
      {busy && <p role="status" className="mt-3 text-sm text-slate-300">Loading orders…</p>}
      {error && <p role="alert" className="mt-3 text-sm text-rose-200">{error}</p>}
      {!busy && !error && !rows.length && <p className="mt-3 text-sm text-slate-300">{page ? "No more orders." : "Your purchases and requests will appear here."}</p>}
      <div className="mt-3 space-y-2">
        {rows.map((order) => {
          const status = {
            pending_approval: "Pending DM approval",
            completed: order.reviewed_at ? "Approved by DM" : "Completed",
            rejected: "Rejected",
            cancelled: "Cancelled",
            refunded: "Refunded"
          }[order.order_status];
          return (
            <article key={order.order_id} className={accountCard}>
              <div className="flex flex-wrap justify-between gap-2">
                <strong>{status}</strong>
                <time className="text-slate-300" dateTime={order.ordered_at}>{new Date(order.ordered_at).toLocaleString()}</time>
              </div>
              <ul className="my-2 space-y-1">
                {order.order_items.map((item, index) => (
                  <li key={index} className="flex justify-between gap-3">
                    <span>{item.quantity} × {item.name}</span>
                    <span>{formatCurrency(item.unit_price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="text-cyan-100">
                {formatCurrency(order.order_total)} {["rejected", "refunded"].includes(order.order_status) ? "returned to wallet" : order.order_status === "pending_approval" ? "reserved" : "order total"}
              </p>
              {order.delivery_status && (
                <div className="mt-3 border-t border-white/10 pt-3">
                  <p className="font-semibold text-amber-100">Delivery · {deliveryLabels[order.delivery_status]}</p>
                  {order.delivery_status !== "delivered" && (
                    <p className="mt-1 text-slate-300">{order.delivery_estimate ? `Estimated arrival: ${order.delivery_estimate}` : "Arrival estimate pending"}</p>
                  )}
                  {order.delivery_events?.length > 0 && (
                    <details className="mt-2 text-slate-200">
                      <summary className="cursor-pointer text-cyan-100">Tracking history</summary>
                      <ol className="mt-2 space-y-2 border-l border-cyan-300/25 pl-3">
                        {order.delivery_events.map((event, index) => (
                          <li key={index} className="flex flex-wrap justify-between gap-x-3">
                            <span>{deliveryLabels[event.status]}</span>
                            <time className="text-slate-300" dateTime={event.recorded_at}>{new Date(event.recorded_at).toLocaleString()}</time>
                          </li>
                        ))}
                      </ol>
                    </details>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
      {(page > 0 || rows.length === 20) && (
        <div className="mt-3 flex gap-2">
          <button type="button" className={accountButton} disabled={!page || busy} onClick={() => setPage(page - 1)}>Newer orders</button>
          <button type="button" className={accountButton} disabled={rows.length < 20 || busy} onClick={() => setPage(page + 1)}>Older orders</button>
        </div>
      )}
    </section>
  );
}

function DeliveryEditor({ order, busy, onSave }) {
  const [status, setStatus] = useState(order.delivery_status || "awaiting_delivery");
  const [estimate, setEstimate] = useState(order.delivery_estimate || "");

  return (
    <form className="mt-3 grid gap-2 sm:grid-cols-[1fr_2fr_auto] sm:items-end" onSubmit={(event) => {
      event.preventDefault();
      onSave(order.order_id, status, estimate);
    }}>
      <label className="grid gap-1">
        Delivery status
        <select className={accountInput} value={status} onChange={(event) => setStatus(event.target.value)} disabled={busy}>
          {Object.entries(deliveryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="grid gap-1">
        Estimated arrival
        <input className={accountInput} value={estimate} onChange={(event) => setEstimate(event.target.value)} maxLength={120} placeholder="e.g. Next session or Lumiphase 24" disabled={busy} />
      </label>
      <button type="submit" className={accountButton} disabled={busy || (status === order.delivery_status && estimate.trim() === (order.delivery_estimate || ""))}>Save tracking</button>
    </form>
  );
}

function FundingRequests({ token, isDm = false }) {
  const load = useCallback(() => marketplaceRpc(token, "marketplace_funding_history", { include_all: isDm }), [token, isDm]);
  const { rows, busy, error, refresh } = useMarketplaceList(load);
  const [sheet, setSheet] = useState("");
  const [amount, setAmount] = useState("");
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState(null);
  const [issued, setIssued] = useState(null);
  const actionInProgress = useRef(false);
  const requestAttempt = useRef(null);

  async function submit(event) {
    event.preventDefault();
    if (actionInProgress.current) return;
    actionInProgress.current = true;
    setWorking(true);
    setNotice(null);
    const url = sheet.trim();
    const value = Number(amount);
    if (requestAttempt.current?.url !== url || requestAttempt.current?.value !== value) {
      requestAttempt.current = { id: crypto.randomUUID(), url, value };
    }
    try {
      await marketplaceRpc(token, "marketplace_request_funding", {
        request_id: requestAttempt.current.id, sheet_url: url, requested_lumina: value
      });
      requestAttempt.current = null;
      setAmount("");
      setNotice({ text: "Request sent to your DM." });
      refresh();
    } catch (error) {
      setNotice({ text: error.message, error: true });
    } finally {
      actionInProgress.current = false;
      setWorking(false);
    }
  }

  async function review(request, approve) {
    if (actionInProgress.current || issued) return;
    if (approve && !window.confirm(`Have you verified the character and recorded the campaign transfer for ${formatCurrency(request.amount)}?`)) return;
    actionInProgress.current = true;
    setWorking(true);
    setNotice(null);
    try {
      const code = await marketplaceRpc(token, "dm_marketplace_review_funding", { target_request: request.request_id, approve });
      if (approve) setIssued({ code, player: request.player_name });
      else setNotice({ text: "Funding request declined." });
      refresh();
    } catch (error) {
      setNotice({ text: error.message, error: true });
      refresh();
    } finally {
      actionInProgress.current = false;
      setWorking(false);
    }
  }

  return (
    <section className="mt-4 space-y-3 border-t border-white/10 pt-4" aria-label={isDm ? "Character Funding Requests" : "D&D Beyond Funding"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold">{isDm ? "Character Funding Requests" : "D&D Beyond Funding"}</h3>
        <button type="button" className={accountButton} disabled={busy || working} onClick={refresh}>Refresh requests</button>
      </div>
      {!isDm && (
        <form onSubmit={submit} className="grid gap-3">
          <p className="text-sm text-slate-300">Send your character sheet and the amount you want to load. Your DM verifies the transfer and gives you a one-time code to redeem above.</p>
          <label className="grid gap-1 text-sm">
            Character sheet link
            <input type="url" required maxLength={500} value={sheet} onChange={(event) => setSheet(event.target.value)} className={accountInput} placeholder="https://www.dndbeyond.com/characters/123456" />
          </label>
          <label className="grid gap-1 text-sm">
            Requested Lumina
            <input type="number" required min="1" max="1000000000" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} className={accountInput} />
          </label>
          <button type="submit" disabled={working} className={accountButton}>{working ? "Sending…" : "Request funding"}</button>
        </form>
      )}
      {notice && <p role={notice.error ? "alert" : "status"} className={notice.error ? "text-sm text-rose-200" : "text-sm text-emerald-200"}>{notice.text}</p>}
      {issued && (
        <div className={accountCard}>
          <p>Copy this one-time code for {issued.player}. Save it before closing this panel.</p>
          <code className="my-2 block select-all break-all text-amber-100">{issued.code}</code>
          <div className="flex gap-2">
            <button type="button" className={accountButton} onClick={async () => {
              try {
                await navigator.clipboard.writeText(issued.code);
                setNotice({ text: "Code copied." });
              } catch {
                setNotice({ text: "Select and copy the code above.", error: true });
              }
            }}>Copy code</button>
            <button type="button" className={accountButton} onClick={() => setIssued(null)}>Done with code</button>
          </div>
        </div>
      )}
      {busy && <p role="status" className="text-sm text-slate-300">Loading funding requests…</p>}
      {error && <p role="alert" className="text-sm text-rose-200">{error}</p>}
      {!busy && !error && !rows.length && <p className="text-sm text-slate-300">No funding requests yet.</p>}
      {rows.length > 0 && <div className="max-h-96 space-y-2 overflow-y-auto">
        {rows.map((request) => (
          <article key={request.request_id} className={accountCard}>
            <div className="flex flex-wrap justify-between gap-2">
              <strong>{isDm ? `${request.player_name} · ` : ""}{formatCurrency(request.amount)}</strong>
              <span className="text-amber-100">{fundingLabels[request.request_status]}</span>
            </div>
            <a href={request.character_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-cyan-200 underline">View character sheet</a>
            <time className="ml-2 text-xs text-slate-300" dateTime={request.requested_at}>{new Date(request.requested_at).toLocaleDateString()}</time>
            {isDm && request.request_status === "pending" && (
              <div className="mt-2 flex gap-2">
                <button type="button" className={accountButton} disabled={working || Boolean(issued)} onClick={() => review(request, true)}>Issue code</button>
                <button type="button" className={accountButton} disabled={working || Boolean(issued)} onClick={() => review(request, false)}>Decline</button>
              </div>
            )}
          </article>
        ))}
      </div>}
    </section>
  );
}

function Badge({ children, className = "" }) {
  return <span className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 ${className}`}>{children}</span>;
}

function StatRow({ label, value }) {
  return (
    <div className="grid grid-cols-5 gap-3 border-b border-cyan-300/10 py-3 last:border-b-0">
      <div className="col-span-2 text-xs font-semibold uppercase tracking-widest text-cyan-300">{label}</div>
      <div className="col-span-3 text-sm text-slate-100">{value}</div>
    </div>
  );
}

function WorldNoticeCard({ badge, title, copy, tone = "cyan" }) {
  const toneStyles = {
    cyan: "border-cyan-300/20 bg-cyan-400/10 text-cyan-100",
    amber: "border-amber-300/20 bg-amber-400/10 text-amber-100",
    fuchsia: "border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100",
    rose: "border-rose-300/20 bg-rose-500/10 text-rose-100"
  };

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-4 backdrop-blur">
      <p className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${toneStyles[tone]}`}>{badge}</p>
      <h3 className="mt-3 text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-200">{copy}</p>
    </div>
  );
}

function ProductCard({ item, selected, onClick, isFavorite, onToggleFavorite, favoriteDisabled, onAddToCart, className = "" }) {
  return (
    <div className={`overflow-hidden rounded-2xl border text-left transition ${selected ? "border-fuchsia-400/70 bg-fuchsia-400/10" : "border-white/10 bg-white/[0.03] hover:border-cyan-300/50 hover:bg-white/[0.06]"} ${className}`}>
      <button onClick={onClick} className="group w-full">
        <div className="relative h-28 overflow-hidden">
          <img src={getItemDisplayImage(item)} alt="" className="h-full w-full object-cover opacity-60 transition group-hover:scale-105" />
          <div className={`absolute inset-0 bg-gradient-to-t ${item.accent} opacity-35`} />
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-sm font-bold text-white">{item.name}</p>
            <p className="text-xs text-slate-200">{formatCurrency(getPriceValue(item))}</p>
          </div>
        </div>
      </button>
      <div className="space-y-2 px-3 pb-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.2em] text-slate-300">{isFavorite ? "Saved" : "Wishlist"}</span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite?.(item.id);
            }}
            disabled={favoriteDisabled}
            aria-label={isFavorite ? `Remove ${item.name} from Wish Vault` : `Save ${item.name} to Wish Vault`}
            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-100 transition hover:border-fuchsia-300/60"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-fuchsia-300 text-fuchsia-300" : "text-slate-200"}`} />
          </button>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAddToCart?.(item);
          }}
          className="w-full rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

function normalizeSessionResponse(response) {
  const player = response?.player?.player || response?.player || null;
  const favorites = response?.favorites || player?.favorites || [];

  return {
    player,
    favorites: Array.isArray(favorites) ? favorites : []
  };
}

function formatLoginDate(value) {
  if (!value) {
    return "Just now";
  }

  return new Date(value).toLocaleString();
}

function deriveBadges(profile, favoriteCount) {
  const badges = [];

  if (!profile) {
    return badges;
  }

  if (profile.loginCount <= 1) {
    badges.push({ name: "New Recruit", tone: "border-cyan-300/40 bg-cyan-500/10 text-cyan-100" });
  }

  if (favoriteCount >= 3) {
    badges.push({ name: "Explorer", tone: "border-emerald-300/40 bg-emerald-500/10 text-emerald-100" });
  }

  if (favoriteCount >= 5) {
    badges.push({ name: "Collector", tone: "border-fuchsia-300/40 bg-fuchsia-500/10 text-fuchsia-100" });
  }

  if (profile.loginCount >= 5) {
    badges.push({ name: "Veteran", tone: "border-amber-300/40 bg-amber-500/10 text-amber-100" });
  }

  if (favoriteCount >= 8) {
    badges.push({ name: "Legend", tone: "border-purple-300/40 bg-purple-500/10 text-purple-100" });
  }

  return badges;
}

function formatCurrency(value) {
  return `ℓ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value)}`;
}

function normalizeSearch(value) {
  return value.toLowerCase().replace(/[™’']/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function getPriceValue(item) {
  const value = Number(item.price);
  return Number.isFinite(value) ? value : 0;
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

function buildPlaceholderImage(item) {
  const palette = ["#0f172a", "#1d4ed8", "#7c3aed", "#f59e0b", "#ec4899", "#0f766e"];
  const seed = hashString(item.name || item.id || "item");
  const bg1 = palette[seed % palette.length];
  const bg2 = palette[(seed + 3) % palette.length];
  const title = (item.name || "Unknown Item").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const subtitle = `${item.rarity || "Unknown"} • ${item.category || "Curio"}`
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 560">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}" />
          <stop offset="100%" stop-color="${bg2}" />
        </linearGradient>
      </defs>
      <rect width="800" height="560" rx="36" fill="url(#gradient)"/>
      <circle cx="660" cy="112" r="90" fill="rgba(255,255,255,0.12)"/>
      <circle cx="128" cy="480" r="130" fill="rgba(255,255,255,0.08)"/>
      <rect x="70" y="70" width="660" height="420" rx="28" fill="rgba(15,23,42,0.16)" stroke="rgba(255,255,255,0.12)"/>
      <text x="50%" y="44%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="white">${title}</text>
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="rgba(255,255,255,0.88)">${subtitle}</text>
      <text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="rgba(255,255,255,0.7)">Generated placeholder artwork</text>
    </svg>
  `)}`;
}

function getItemDisplayImage(item) {
  if (!item?.image) {
    return buildPlaceholderImage(item);
  }

  return item.image.startsWith("/images/") ? buildPlaceholderImage(item) : item.image;
}

function getAllTags(items) {
  return Array.from(new Set(items.flatMap((item) => item.tags))).sort((a, b) => a.localeCompare(b));
}

const defaultPlayer = {
  id: "guest-player",
  username: "Guest Operator",
  wallet: 15000,
  ddbGold: 15000,
  ddbLastSyncedAt: null,
  ddbSourceUrl: "",
  ddbSyncStatus: "Local starter wallet",
  inventory: ["Starter kit"]
};

const financingRules = {
  PrimeCredit: {
    label: "PrimeCredit™",
    slogan: "Fast approval. Faster regret.",
    risk: "Financial pressure, missed payments, reputation damage, item lockouts."
  },
  Resonance: {
    label: "Resonance Financing",
    slogan: "The item chooses what you owe.",
    risk: "Emotional debt, Sin consequences, item whispers, possible SR increase."
  },
  BlackLedger: {
    label: "Black Ledger Contract",
    slogan: "Very cheap. Very collectible. Unfortunately, so are you.",
    risk: "Dangerous favors, bounty collectors, memory collateral, future obligations."
  }
};

export default function LumaPrimeMarketplace() {
  const [selectedId, setSelectedId] = useState(originalItems[0].id);
  const [query, setQuery] = useState("");
  const [searchSelectionId, setSearchSelectionId] = useState(null);
  const listingPanel = useRef(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [sessionToken, setSessionToken] = useState(() => (typeof window === "undefined" ? null : localStorage.getItem("luma-prime-token")));
  const [profile, setProfile] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isDmAdmin, setIsDmAdmin] = useState(false);
  const [showDmDashboard, setShowDmDashboard] = useState(false);
  const [dmDepositAmount, setDmDepositAmount] = useState("100");
  const [generatedDmCode, setGeneratedDmCode] = useState("");
  const [generatingDmCode, setGeneratingDmCode] = useState(false);
  const [dmPlayers, setDmPlayers] = useState([]);
  const [dmTransactions, setDmTransactions] = useState([]);
  const [dmOrders, setDmOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryLoaded, setInventoryLoaded] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [adjustingPlayer, setAdjustingPlayer] = useState(null);
  const [dmCommerceNotice, setDmCommerceNotice] = useState("");
  const [dmWalletNotice, setDmWalletNotice] = useState("");
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState(null);
  const checkoutInProgress = useRef(false);
  const [dmBusy, setDmBusy] = useState(false);
  const [loadingDmPlayers, setLoadingDmPlayers] = useState(false);
  const [dmPlayersError, setDmPlayersError] = useState("");
  const [depositCode, setDepositCode] = useState("");
  const [redeemingCode, setRedeemingCode] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [wishError, setWishError] = useState("");
  const [wishLoaded, setWishLoaded] = useState(false);
  const [wishRevision, setWishRevision] = useState(0);
  const wishInProgress = useRef(false);
  const accountToken = useRef(sessionToken);
  const [showOrders, setShowOrders] = useState(false);
  const [ordersRevision, setOrdersRevision] = useState(0);
  const [walletNotice, setWalletNotice] = useState(null);
  const [dmOrderError, setDmOrderError] = useState("");
  const [status, setStatus] = useState({ message: "Log in to save favorites and unlock your dashboard.", tone: "info" });
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortMode, setSortMode] = useState("featured");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedRarity, setSelectedRarity] = useState("All");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showFinancingPage, setShowFinancingPage] = useState(false);
  const [players, setPlayers] = useState(() => {
    if (typeof window === "undefined") {
      return [defaultPlayer];
    }

    try {
      const saved = window.localStorage.getItem("luma-prime-finance-players");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore storage errors and fall back to defaults.
    }

    return [defaultPlayer];
  });
  const [financedItems, setFinancedItems] = useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const saved = window.localStorage.getItem("luma-prime-financed-items");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore storage errors and fall back to defaults.
    }

    return [];
  });
  const [creditStatus, setCreditStatus] = useState(() => {
    if (typeof window === "undefined") {
      return "Ready to finance";
    }

    try {
      const saved = window.localStorage.getItem("luma-prime-credit-status");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore storage errors and fall back to defaults.
    }

    return "Ready to finance";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const savedCart = window.localStorage.getItem("luma-prime-cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("luma-prime-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem("luma-prime-finance-players", JSON.stringify(players));
    window.localStorage.setItem("luma-prime-financed-items", JSON.stringify(financedItems));
    window.localStorage.setItem("luma-prime-credit-status", JSON.stringify(creditStatus));
  }, [players, financedItems, creditStatus]);

  useEffect(() => {
    if (!profile?.username) {
      return;
    }

    setPlayers((currentPlayers) =>
      currentPlayers.map((player, index) =>
        index === 0
          ? {
              ...player,
              username: profile.username
            }
          : player
      )
    );
  }, [profile]);

  const items = useMemo(() => {
    if (!inventoryLoaded) return originalItems;
    const originals = new Map(originalItems.map((item) => [item.id, item]));
    const products = new Map(inventory.map((product) => [product.product_id, product]));
    const orderedProducts = [
      ...originalItems.map((item) => products.get(item.id)).filter(Boolean),
      ...inventory.filter((product) => !originals.has(product.product_id))
    ];
    return orderedProducts.filter((product) => product.is_active)
      .map((product) => catalogItem(product, originals.get(product.product_id)));
  }, [inventory, inventoryLoaded]);
  const searchQuery = normalizeSearch(query);
  const matches = useMemo(() => {
    const matchingItems = [];
    const terms = searchQuery.split(" ");
    for (const item of items) {
      if (selectedTag !== "All" && !item.tags.includes(selectedTag)) continue;
      if (selectedRarity !== "All" && item.rarity !== selectedRarity) continue;

      const name = normalizeSearch(item.name);
      const searchableText = normalizeSearch([item.name, item.category, item.rarity, item.vendor, ...item.tags].join(" "));
      if (searchQuery && !terms.every((term) => searchableText.includes(term))) continue;

      let rank = 4;
      if (name === searchQuery) rank = 0;
      else if (name.startsWith(searchQuery)) rank = 1;
      else if (name.includes(searchQuery)) rank = 2;
      else if (terms.every((term) => name.includes(term))) rank = 3;
      matchingItems.push({ item, rank });
    }

    return matchingItems.sort((first, second) => first.rank - second.rank).map(({ item }) => item);
  }, [items, searchQuery, selectedTag, selectedRarity]);

  const filtered = useMemo(() => {
    if (sortMode === "price-low") return [...matches].sort((a, b) => getPriceValue(a) - getPriceValue(b));
    if (sortMode === "price-high") return [...matches].sort((a, b) => getPriceValue(b) - getPriceValue(a));
    return matches;
  }, [matches, sortMode]);

  const selected = searchQuery
    ? matches.find((item) => item.id === searchSelectionId) || matches[0]
    : items.find((item) => item.id === selectedId) || items[0];

  function updateSearch(value) {
    setQuery(value);
    setSearchSelectionId(null);
    setShowFinancingPage(false);
  }

  function openListing(itemId) {
    if (searchQuery && matches.some((item) => item.id === itemId)) {
      setSearchSelectionId(itemId);
    } else {
      updateSearch("");
      setSelectedId(itemId);
    }
  }

  const isFavorite = (itemId) => favorites.includes(itemId);
  const badgeList = useMemo(() => deriveBadges(profile, favorites.length), [profile, favorites.length]);
  const cartCount = cart.reduce((total, entry) => total + entry.quantity, 0);
  const inventoryById = useMemo(
    () => new Map(inventory.map((product) => [product.product_id, product])),
    [inventory]
  );
  const cartLines = cart.map((entry) => {
    const product = inventoryById.get(entry.item.id);
    return { ...entry, product, unitPrice: product ? Number(product.price) : getPriceValue(entry.item) };
  });
  const { purchaseTotal, reservationTotal, hasPurchase, hasRequest } = cartLines.reduce((totals, line) => {
    if (line.product?.requires_dm_approval) {
      totals.reservationTotal += line.unitPrice * line.quantity;
      totals.hasRequest = true;
    } else {
      totals.purchaseTotal += line.unitPrice * line.quantity;
      totals.hasPurchase = true;
    }
    return totals;
  }, { purchaseTotal: 0, reservationTotal: 0, hasPurchase: false, hasRequest: false });
  const checkoutStorageKey = profile ? `lumaprime-checkout-${profile.id}` : null;
  const cartSignature = JSON.stringify(cartLines.map(({ item, quantity }) => [item.id, quantity])
    .sort(([first], [second]) => first.localeCompare(second)));
  const retry = savedCheckoutKeys(checkoutStorageKey)[cartSignature];
  const cartReady = cartLines.every(({ product, quantity }) =>
    product?.is_active && (product.stock_quantity === null || quantity <= product.stock_quantity)
  );
  const tagOptions = ["All", ...getAllTags(items)];
  const rarityOptions = ["All", ...Array.from(new Set(items.map((item) => item.rarity)))];
  const current = { ...(players[0] || defaultPlayer), wallet: walletBalance ?? 0 };
  const unlocked = Boolean(current);
  const worldNotices = useMemo(() => {
    const notices = [
      {
        badge: "Sponsored",
        title: "Harbor Supply Drop",
        copy: "Duty-gear, recovery kits, and courier bundles are under a short-term premium discount near the dockside quarter.",
        tone: "cyan"
      },
      {
        badge: "Field Bulletin",
        title: "Gate Watch Update",
        copy: "Transit density is rising at the Spiral Gate. Travelers who carry high-value items are advised to keep paperwork and travel signatures current.",
        tone: "amber"
      },
      {
        badge: "Guild Notice",
        title: "Curio Demand Spike",
        copy: "Collectors are increasingly seeking recovery, healing, and utility relics. Inventory specialists expect more competition around the end of the cycle.",
        tone: "fuchsia"
      }
    ];

    if (profile) {
      notices.push({
        badge: "Player Bulletin",
        title: `${profile.username} has a fresh watchlist`,
        copy: `Your current watchlist contains ${favorites.length} listings, and local traders are reacting to the pattern of your selections.`,
        tone: "cyan"
      });
    }

    if (cartCount > 0) {
      notices.push({
        badge: "Market Echo",
        title: "Cart activity is rising",
        copy: `You have ${cartCount} item${cartCount === 1 ? "" : "s"} in motion. The market is trending toward faster fulfillment and higher demand in that lane.`,
        tone: "amber"
      });
    }

    if (financedItems.length > 0) {
      notices.push({
        badge: "Credit Bulletin",
        title: "Borrowed relics are under review",
        copy: `Your active financing contracts are being watched by the credit guild. Keep payments current to avoid a reputation dip.`,
        tone: "rose"
      });
    }

    if (selected && (selected.category.includes("Healing") || selected.tags.includes("Rest") || selected.tags.includes("Wellness"))) {
      notices.push({
        badge: "Public Notice",
        title: `Recovery demand for ${selected.name}`,
        copy: `The district is seeing stronger demand for recovery and wellness gear, and vendors are shifting their inventory toward the same lane.`,
        tone: "fuchsia"
      });
    }

    if (current.wallet < 2500) {
      notices.push({
        badge: "Guild Warning",
        title: "Budget tightening in the market",
        copy: `Wallet reserves are tight. Smaller, high-utility purchases are currently moving faster than premium collector pieces.`,
        tone: "amber"
      });
    }

    const unique = Array.from(new Map(notices.map((notice) => [notice.title, notice])).values());
    return unique.slice(0, 3);
  }, [cartCount, current.wallet, financedItems.length, favorites.length, profile, selected]);

  const adjustWalletBalance = (delta) => {
    setPlayers((prev) =>
      prev.map((player, index) => {
        if (index !== 0) {
          return player;
        }

        const nextWallet = Math.max(0, player.wallet + delta);
        const nextDdbGold = typeof player.ddbGold === "number"
          ? Math.max(0, player.ddbGold + delta)
          : nextWallet;

        return {
          ...player,
          wallet: nextWallet,
          ddbGold: nextDdbGold,
          ddbSyncStatus: player.ddbSyncStatus || "Linked to D&D Beyond"
        };
      })
    );
  };

  const financeItem = (item, type) => {
    setStatus({ message: "PrimeCredit purchases are paused until secure checkout is implemented.", tone: "warning" });
    return;
    if (!unlocked) {
      return;
    }

    const rule = financingRules[type];
    if (!rule) {
      return;
    }

    const downPayment = type === "PrimeCredit"
      ? (item.price < 1000 ? 0 : Math.ceil(item.price * 0.2))
      : type === "Resonance"
        ? 0
        : Math.ceil(item.price * 0.1);

    const cycles = type === "PrimeCredit"
      ? (item.price < 1000 ? 4 : item.price <= 5000 ? 8 : 10)
      : type === "Resonance"
        ? 7
        : 3;

    if (current.wallet < downPayment) {
      setStatus({ message: `You need ${formatCurrency(downPayment)} for the ${rule.label} down payment.`, tone: "warning" });
      return;
    }

    adjustWalletBalance(-downPayment);

    setPlayers((prev) =>
      prev.map((player) =>
        player.id === current.id
          ? {
              ...player,
              inventory: [...player.inventory, `${item.name} (${rule.label})`]
            }
          : player
      )
    );

    setFinancedItems((prev) => [
      ...prev,
      {
        id: `DEBT-${Date.now()}`,
        playerId: current.id,
        itemName: item.name,
        itemPrice: item.price,
        type: rule.label,
        slogan: rule.slogan,
        downPayment,
        remainingBalance: item.price - downPayment,
        cyclesRemaining: cycles,
        paymentDue: Math.ceil((item.price - downPayment) / cycles),
        risk: rule.risk,
        missedPayments: 0
      }
    ]);

    setCreditStatus("Financing active");
    setStatus({ message: `Financing applied for ${item.name} via ${rule.label}.`, tone: "success" });
  };

  const missedPaymentConsequence = () => {
    const roll = Math.ceil(Math.random() * 6);
    const consequences = {
      1: "Aggressive reminders issued.",
      2: "Account restrictions activated.",
      3: "Repossession agents dispatched.",
      4: "Travel flagged at Spiral Gate checkpoints.",
      5: "Financed item partially disabled.",
      6: "Debt bounty issued."
    };

    return consequences[roll];
  };

  const processPayment = (debtId) => {
    setStatus({ message: "PrimeCredit payments are paused until secure checkout is implemented.", tone: "warning" });
    return;
    const debt = financedItems.find((entry) => entry.id === debtId);
    if (!debt) {
      return;
    }

    if (current.wallet >= debt.paymentDue) {
      adjustWalletBalance(-debt.paymentDue);

      setFinancedItems((prev) =>
        prev
          .map((entry) =>
            entry.id === debtId
              ? {
                  ...entry,
                  remainingBalance: Math.max(0, entry.remainingBalance - entry.paymentDue),
                  cyclesRemaining: Math.max(0, entry.cyclesRemaining - 1)
                }
              : entry
          )
          .filter((entry) => entry.remainingBalance > 0)
      );

      setCreditStatus("Reliable Borrower");
      setStatus({ message: `Payment processed for ${debt.itemName}.`, tone: "success" });
    } else {
      const consequence = missedPaymentConsequence();

      setFinancedItems((prev) =>
        prev.map((entry) =>
          entry.id === debtId
            ? {
                ...entry,
                missedPayments: entry.missedPayments + 1,
                lastConsequence: consequence
              }
            : entry
        )
      );

      setCreditStatus((prev) => (prev === "Blacklisted" ? "Blacklisted" : "Delinquent"));
      setStatus({ message: `Payment missed for ${debt.itemName}. ${consequence}`, tone: "warning" });
    }
  };

  useEffect(() => {
    if (!sessionToken) {
      setProfile(null);
      setFavorites([]);
      setWalletBalance(null);
      setIsDmAdmin(false);
      setShowDmDashboard(false);
      setDmPlayers([]);
      return;
    }
    let active = true;
    async function loadProfile() {
      try {
        const user = await supabaseRequest("/auth/v1/user", { token: sessionToken });
        const rows = await supabaseRequest(`/rest/v1/player_profiles?id=eq.${encodeURIComponent(user.id)}&select=id,display_name,created_at,lumina_balance`, { token: sessionToken });
        if (!active) return;
        const row = rows[0];
        setProfile({
          id: user.id,
          username: row?.display_name || user.user_metadata?.display_name || "Adventurer",
          createdAt: row?.created_at || user.created_at,
          lastLoginAt: user.last_sign_in_at,
          loginCount: 1
        });
        setWalletBalance(row?.lumina_balance ?? 0);
        const adminCheck = await supabaseRequest("/rest/v1/rpc/is_dm_admin", { method: "POST", token: sessionToken, body: {} });
        if (!active) return;
        setIsDmAdmin(adminCheck === true);
        setStatus({ message: "Signed in successfully.", tone: "success" });
      } catch (error) {
        if (!active) return;
        localStorage.removeItem("luma-prime-token");
        setSessionToken(null);
        setProfile(null);
        setFavorites([]);
        setWalletBalance(null);
        setIsDmAdmin(false);
        setShowDmDashboard(false);
        setStatus({ message: `Please log in again: ${error.message}`, tone: "warning" });
      }
    }
    loadProfile();
    return () => { active = false; };
  }, [sessionToken]);

  useEffect(() => {
    accountToken.current = sessionToken;
  }, [sessionToken]);

  const playerId = profile?.id;
  useEffect(() => {
    setWishLoaded(false);
    setWishError("");
    if (!playerId || !sessionToken) return;
    let active = true;
    const legacy = localFavorites(playerId).filter((id) => typeof id === "string");
    marketplaceRpc(sessionToken, "marketplace_wish_list", { legacy_ids: legacy })
      .then((saved) => {
        if (!active) return;
        setFavorites(saved);
        setWishLoaded(true);
        try { localStorage.removeItem(`luma-prime-favorites-${playerId}`); }
        catch { /* Migration is safe to repeat. */ }
      })
      .catch((error) => {
        if (!active) return;
        setFavorites(legacy);
        setWishError(error.message);
      });
    return () => { active = false; };
  }, [playerId, sessionToken, wishRevision]);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setLoadingAuth(true);
    setStatus({ message: "", tone: "info" });
    const username = authForm.username.trim();
    const email = authForm.email.trim();
    const password = authForm.password;
    try {
      if (!email || !password || (authMode === "register" && !username)) throw new Error("Enter your email, password, and (for registration) player name.");
      if (authMode === "register" && password !== authForm.confirmPassword) throw new Error("Passwords do not match.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");
      if (authMode === "register") {
        const response = await supabaseRequest("/auth/v1/signup", { method: "POST", body: { email, password, data: { display_name: username } } });
        if (response.access_token) {
          localStorage.setItem("luma-prime-token", response.access_token);
          setSessionToken(response.access_token);
        } else {
          setAuthMode("login");
          setStatus({ message: "Account created. Check your email for the confirmation link, then log in.", tone: "success" });
        }
      } else {
        const response = await supabaseRequest("/auth/v1/token?grant_type=password", { method: "POST", body: { email, password } });
        if (!response.access_token) throw new Error("No login session returned.");
        localStorage.setItem("luma-prime-token", response.access_token);
        setSessionToken(response.access_token);
      }
      setAuthForm({ username: "", email, password: "", confirmPassword: "" });
    } catch (error) {
      setStatus({ message: error.message, tone: "warning" });
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleLogout = async () => {
    if (checkoutInProgress.current) return;
    accountToken.current = null;
    setCheckoutMessage(null);
    setShowOrders(false);
    setWalletNotice(null);
    setDepositCode("");
    setDmOrders([]);
    setDmTransactions([]);
    setDmOrderError("");
    setDmCommerceNotice("");
    setDmWalletNotice("");
    setEditingListing(null);
    setAdjustingPlayer(null);
    setWishLoaded(false);
    if (sessionToken) {
      try { await supabaseRequest("/auth/v1/logout", { method: "POST", token: sessionToken }); }
      catch { /* Clear local session regardless. */ }
    }
    localStorage.removeItem("luma-prime-token");
    setSessionToken(null);
    setProfile(null);
    setFavorites([]);
    setWalletBalance(null);
    setIsDmAdmin(false);
    setShowDmDashboard(false);
    setGeneratedDmCode("");
    setDmPlayers([]);
    setStatus({ message: "Signed out.", tone: "info" });
  };

  const loadDmPlayers = async () => {
    if (!sessionToken || !isDmAdmin) return;
    setLoadingDmPlayers(true);
    setDmPlayersError("");
    try {
      const result = await supabaseRequest("/rest/v1/rpc/dm_list_players", {
        method: "POST", token: sessionToken, body: {}
      });
      if (!Array.isArray(result)) throw new Error("Unexpected player list response.");
      setDmPlayers(result);
    } catch (error) {
      setDmPlayersError(error.message);
    } finally {
      setLoadingDmPlayers(false);
    }
  };

  const loadInventory = async () => {
    try {
      const rows = await supabaseRequest("/rest/v1/marketplace_inventory?select=product_id,product_name,rarity,price,stock_quantity,requires_dm_approval,is_active,listing_details,updated_at&order=product_name.asc");
      if (Array.isArray(rows)) {
        setInventory(rows);
        setInventoryLoaded(true);
      }
    } catch (error) {
      setStatus({ message: `Could not load inventory: ${error.message}`, tone: "warning" });
    }
  };

  const loadDmCommerce = async () => {
    if (!isDmAdmin || !sessionToken) return;
    setDmBusy(true);
    setDmOrderError("");
    try {
      const [transactions, orders] = await Promise.all([
        supabaseRequest("/rest/v1/rpc/dm_list_transactions", { method: "POST", token: sessionToken, body: {} }),
        marketplaceRpc(sessionToken, "dm_marketplace_orders_with_refunds")
      ]);
      if (accountToken.current !== sessionToken) return;
      setDmTransactions(transactions);
      setDmOrders(orders);
      await loadInventory();
    } catch (error) {
      setDmOrderError(error.message);
    } finally { setDmBusy(false); }
  };

  const saveListing = async (details) => {
    await marketplaceRpc(sessionToken, "dm_marketplace_save_listing", details);
    if (accountToken.current !== sessionToken) return;
    setEditingListing(null);
    setDmCommerceNotice(`Saved ${details.listing.name.trim()}.`);
    await loadInventory();
  };

  const adjustPlayerWallet = async (details) => {
    const balance = await marketplaceRpc(sessionToken, "dm_marketplace_adjust_wallet", details);
    if (accountToken.current !== sessionToken) return;
    if (details.target_player === profile.id) setWalletBalance(balance);
    setDmPlayers((players) => players.map((player) =>
      player.player_id === details.target_player ? { ...player, balance } : player
    ));
    setAdjustingPlayer(null);
    setDmWalletNotice(`Wallet updated to ${formatCurrency(balance)}.`);
    await loadDmCommerce();
  };

  const refundOrder = async (orderId, reason, restoreStock) => {
    if (dmBusy || !isDmAdmin || !sessionToken) return;
    setDmBusy(true);
    setDmOrderError("");
    setDmCommerceNotice("");
    try {
      await marketplaceRpc(sessionToken, "dm_marketplace_refund_order", {
        target_order: orderId, reason_text: reason, restore_stock: restoreStock
      });
      if (accountToken.current !== sessionToken) return;
      setDmOrders((orders) => orders.map((order) => order.order_id === orderId
        ? { ...order, order_status: "refunded", refund_reason: reason } : order
      ));
      setOrdersRevision((revision) => revision + 1);
      setDmCommerceNotice("Purchase refunded to the player’s wallet.");
      await loadDmCommerce();
      if (dmPlayers.length) await loadDmPlayers();
    } catch (error) {
      if (accountToken.current === sessionToken) setDmOrderError(error.message);
    } finally {
      setDmBusy(false);
    }
  };

  const reviewDmOrder = async (orderId, approve) => {
    if (!window.confirm(`${approve ? "Approve" : "Reject and refund"} this order?`)) return;
    setDmBusy(true);
    try {
      await supabaseRequest("/rest/v1/rpc/dm_review_marketplace_order", { method: "POST", token: sessionToken,
        body: { target_order: orderId, approve } });
      await loadDmCommerce();
      setStatus({ message: `Order ${approve ? "approved" : "rejected and refunded"}.`, tone: "success" });
    } catch (error) { setStatus({ message: `Order review failed: ${error.message}`, tone: "warning" }); }
    finally { setDmBusy(false); }
  };

  const updateDelivery = async (orderId, deliveryStatus, estimate) => {
    if (dmBusy || !isDmAdmin || !sessionToken) return;
    setDmBusy(true);
    setDmOrderError("");
    try {
      await marketplaceRpc(sessionToken, "dm_marketplace_update_tracking", {
        target_order: orderId, new_status: deliveryStatus, arrival_estimate: estimate
      });
      if (accountToken.current !== sessionToken) return;
      setDmOrders((orders) => orders.map((order) =>
        order.order_id === orderId ? { ...order, delivery_status: deliveryStatus, delivery_estimate: estimate.trim() || null } : order
      ));
      setOrdersRevision((revision) => revision + 1);
    } catch (error) {
      setDmOrderError(error.message);
    } finally {
      setDmBusy(false);
    }
  };

  const checkoutCart = async () => {
    if (!sessionToken || !profile || !cartLines.length || (!cartReady && !retry) || checkoutInProgress.current) return;
    checkoutInProgress.current = true;
    setCheckoutBusy(true);
    setCheckoutMessage(null);

    try {
      const lines = cartLines.map(({ item, quantity, unitPrice, product }) => ({
        product_id: item.id,
        quantity,
        expected_price: product ? unitPrice : undefined,
        expected_approval: product?.requires_dm_approval
      })).sort((a, b) => a.product_id.localeCompare(b.product_id));

      // Keep the same key across network failures and reloads in this tab.
      const savedKeys = savedCheckoutKeys(checkoutStorageKey);
      const attempt = retry || { key: crypto.randomUUID(), lines };
      savedKeys[cartSignature] = attempt;
      sessionStorage.setItem(checkoutStorageKey, JSON.stringify(savedKeys));

      const result = await supabaseRequest("/rest/v1/rpc/place_marketplace_order", {
        method: "POST",
        token: sessionToken,
        body: { cart_items: attempt.lines, checkout_key: attempt.key }
      });
      if (!(result.purchase_id || result.request_id)) {
        throw new Error("Checkout confirmation is unavailable. Retry with the same cart.");
      }

      // Clear the saved cart before releasing its checkout key.
      localStorage.removeItem("luma-prime-cart");
      delete savedKeys[cartSignature];
      sessionStorage.setItem(checkoutStorageKey, JSON.stringify(savedKeys));
      setWalletBalance(result.balance);
      setOrdersRevision((revision) => revision + 1);
      setCart([]);
      const messages = [];
      if (result.purchase_id) messages.push(`Purchase complete. ${formatCurrency(result.purchased_total)} spent.`);
      if (result.request_id) messages.push(`Request sent to the DM. ${formatCurrency(result.reserved_total)} reserved.`);
      setCheckoutMessage({ text: messages.join(" "), success: true });
      await loadInventory();
    } catch (error) {
      // A database validation error confirms that the attempt did not commit.
      if (error.databaseCode === "P0001") {
        const savedKeys = savedCheckoutKeys(checkoutStorageKey);
        delete savedKeys[cartSignature];
        sessionStorage.setItem(checkoutStorageKey, JSON.stringify(savedKeys));
      }
      setCheckoutMessage({ text: error.message, success: false });
      await loadInventory();
    } finally {
      checkoutInProgress.current = false;
      setCheckoutBusy(false);
    }
  };

  useEffect(() => { loadInventory(); }, []);

  const generateDmDepositCode = async (event) => {
    event.preventDefault();
    if (!sessionToken || !isDmAdmin) return;
    const amount = Number(dmDepositAmount);
    if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1000000000) {
      setStatus({ message: "Enter a whole Lumina amount between 1 and 1,000,000,000.", tone: "warning" });
      return;
    }
    setGeneratingDmCode(true);
    setGeneratedDmCode("");
    try {
      const code = await supabaseRequest("/rest/v1/rpc/generate_lumina_code", {
        method: "POST", token: sessionToken, body: { deposit_amount: amount }
      });
      if (typeof code !== "string" || !/^[A-F0-9]{32}$/.test(code)) throw new Error("Unexpected code response.");
      setGeneratedDmCode(code);
      setStatus({ message: `Created a single-use deposit code worth ${formatCurrency(amount)}. Save it now; it cannot be retrieved later.`, tone: "success" });
    } catch (error) {
      setStatus({ message: `Could not generate code: ${error.message}`, tone: "warning" });
    } finally {
      setGeneratingDmCode(false);
    }
  };

  const redeemDepositCode = async (event) => {
    event.preventDefault();
    if (!sessionToken || !profile) {
      setStatus({ message: "Please log in before redeeming a code.", tone: "warning" });
      return;
    }
    const code = depositCode.trim();
    if (!code) {
      setStatus({ message: "Enter your deposit code.", tone: "warning" });
      return;
    }
    setRedeemingCode(true);
    setWalletNotice(null);
    try {
      const newBalance = await supabaseRequest("/rest/v1/rpc/redeem_lumina_code", {
        method: "POST",
        token: sessionToken,
        body: { entered_code: code }
      });
      if (!Number.isSafeInteger(newBalance) || newBalance < 0) {
        throw new Error("Redemption response was unexpected. Refresh and check your wallet.");
      }
      if (accountToken.current !== sessionToken) return;
      setWalletBalance(newBalance);
      setDepositCode("");
      setWalletNotice({ text: `Deposit redeemed. Your wallet now holds ${formatCurrency(newBalance)}.` });
    } catch (error) {
      if (accountToken.current === sessionToken) setWalletNotice({ text: error.message, error: true });
    } finally {
      setRedeemingCode(false);
    }
  };

  const handleToggleFavorite = async (itemId) => {
    if (!sessionToken || !profile) {
      setStatus({ message: "Log in to save favorites.", tone: "warning" });
      return;
    }
    if (!wishLoaded || wishInProgress.current) return;
    wishInProgress.current = true;
    setFavoriteBusy(true);
    setWishError("");
    const saved = !favorites.includes(itemId);
    try {
      await marketplaceRpc(sessionToken, "marketplace_wish_set", { target_product: itemId, saved });
      if (accountToken.current !== sessionToken) return;
      setFavorites((previous) => saved ? [...previous, itemId] : previous.filter((id) => id !== itemId));
    } catch (error) {
      if (accountToken.current === sessionToken) setWishError(error.message);
    } finally {
      wishInProgress.current = false;
      setFavoriteBusy(false);
    }
  };

  const addToCart = (item) => {
    if (checkoutInProgress.current) return;
    setCheckoutMessage(null);
    setCart((current) => {
      const existingIndex = current.findIndex((entry) => entry.item.id === item.id);
      if (existingIndex >= 0) {
        const next = [...current];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + 1
        };
        return next;
      }

      return [...current, { item, quantity: 1 }];
    });

    setStatus({ message: `${item.name} added to your cart.`, tone: "success" });
    setShowCart(true);
  };

  const updateCartQuantity = (itemId, delta) => {
    if (checkoutInProgress.current) return;
    setCheckoutMessage(null);
    setCart((current) => current.flatMap((entry) => {
      if (entry.item.id !== itemId) {
        return [entry];
      }

      const nextQuantity = entry.quantity + delta;
      if (nextQuantity <= 0) {
        return [];
      }

      return [{ ...entry, quantity: nextQuantity }];
    }));
  };

  const removeFromCart = (itemId) => {
    if (checkoutInProgress.current) return;
    setCheckoutMessage(null);
    setCart((current) => current.filter((entry) => entry.item.id !== itemId));
  };

  const clearCart = () => {
    if (checkoutInProgress.current) return;
    setCheckoutMessage(null);
    setCart([]);
    setStatus({ message: "Your cart is empty.", tone: "info" });
  };

  const storefrontListings = (
    <div className={`grid w-full min-w-0 gap-6 lg:grid-cols-[280px_1fr] ${searchQuery ? "mb-6" : ""}`}>
      <aside className={`w-full min-w-0 space-y-4 ${searchQuery ? "order-2 lg:order-1" : ""}`}>
        <div className="rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-300">Active Listings</p>
          <div className="listing-scrollbar w-full min-w-0 overflow-x-auto pb-2 snap-x snap-mandatory">
            <div className="flex w-max gap-3">
              {filtered.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  selected={item.id === selected?.id}
                  isFavorite={isFavorite(item.id)}
                  onToggleFavorite={handleToggleFavorite}
                  favoriteDisabled={favoriteBusy || Boolean(profile && !wishLoaded)}
                  onAddToCart={addToCart}
                  onClick={() => openListing(item.id)}
                  className="w-56 flex-none snap-start"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-300/20 bg-amber-400/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-amber-200"><AlertTriangle className="h-4 w-4" /><span className="text-sm font-semibold">Customs Advisory</span></div>
          <p className="text-xs leading-relaxed text-slate-300">Items marked restricted may trigger port scans, Arrival Visa review, or confiscation in Pearl-controlled territories.</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-300">Field Reports</p>
          <div className="mt-3 space-y-3">
            {worldNotices.map((notice) => (
              <WorldNoticeCard key={`${notice.title}-sidebar`} badge={notice.badge} title={notice.title} copy={notice.copy} tone={notice.tone} />
            ))}
          </div>
        </div>
      </aside>

      <div ref={listingPanel} className={`min-w-0 scroll-mt-4 ${searchQuery ? "order-1 lg:order-2" : ""}`}>
        {!selected ? (
          <section className="self-start rounded-[2rem] border border-cyan-300/15 bg-black/35 p-6" role="status">
            <h2 className="text-xl font-bold text-white">{searchQuery ? "No matching listings" : "No listings available"}</h2>
            {searchQuery && <>
              <p className="mt-2 text-sm text-slate-300">Try a different search or adjust your filters.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className={accountButton} onClick={() => updateSearch("")}>Clear search</button>
                {(selectedTag !== "All" || selectedRarity !== "All") && (
                  <button type="button" className={accountButton} onClick={() => {
                    setSelectedTag("All");
                    setSelectedRarity("All");
                  }}>Clear filters</button>
                )}
              </div>
            </>}
          </section>
        ) : showFinancingPage ? (
          <motion.section key={`finance-${selected.id}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full min-w-0 overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-black/35 shadow-2xl shadow-fuchsia-950/20 backdrop-blur">
            <div className="p-6 sm:p-8">
              <button
                type="button"
                onClick={() => setShowFinancingPage(false)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
              >
                ← Back to listing
              </button>
  
              <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-cyan-300/15 bg-cyan-400/5 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-200">Financing workspace</p>
                    <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">{selected.name}</h1>
                    <p className="mt-2 text-sm text-slate-200">{selected.subtitle}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Current wallet</p>
                        <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(current.wallet)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Credit status</p>
                        <p className="mt-2 text-lg font-semibold text-cyan-100">{creditStatus}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed text-slate-200">{selected.description}</p>
                  </div>
  
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-fuchsia-200">Plan options</p>
                        <p className="mt-1 text-sm text-slate-200">Choose a plan for {selected.name}.</p>
                      </div>
                      <p className="text-sm font-semibold text-cyan-100">{formatCurrency(getPriceValue(selected))}</p>
                    </div>
  
                    <div className="space-y-3">
                      {Object.keys(financingRules).map((type) => {
                        const rule = financingRules[type];
                        const downPayment = type === "PrimeCredit"
                          ? (selected.price < 1000 ? 0 : Math.ceil(selected.price * 0.2))
                          : type === "Resonance"
                            ? 0
                            : Math.ceil(selected.price * 0.1);
  
                        const cycles = type === "PrimeCredit"
                          ? (selected.price < 1000 ? 4 : selected.price <= 5000 ? 8 : 10)
                          : type === "Resonance"
                            ? 7
                            : 3;
  
                        const canAfford = current.wallet >= downPayment;
  
                        return (
                          <div key={type} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-white">{rule.label}</p>
                                <p className="text-xs text-cyan-100">{rule.slogan}</p>
                                <p className="mt-2 text-xs text-slate-300">Down payment: {formatCurrency(downPayment)}</p>
                                <p className="text-xs text-slate-300">Cycles: {cycles}</p>
                                <p className="mt-2 text-xs text-rose-100">Risk: {rule.risk}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => financeItem(selected, type)}
                                disabled={!canAfford}
                                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${canAfford ? "border border-cyan-300/40 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20" : "border border-white/10 bg-white/5 text-slate-400"}`}
                              >
                                {canAfford ? "Use plan" : "Need more funds"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
  
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-fuchsia-200">Active financing</p>
                    {financedItems.length ? (
                      <div className="mt-3 space-y-3">
                        {financedItems.map((debt) => (
                          <div key={debt.id} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                            <p className="text-sm font-semibold text-white">{debt.itemName}</p>
                            <p className="text-xs text-slate-300">{debt.type} • {debt.slogan}</p>
                            <p className="mt-2 text-xs text-slate-200">Remaining balance: {formatCurrency(debt.remainingBalance)}</p>
                            <p className="text-xs text-slate-200">Payment due: {formatCurrency(debt.paymentDue)}</p>
                            <p className="text-xs text-slate-200">Cycles left: {debt.cyclesRemaining}</p>
                            <button
                              type="button"
                              onClick={() => processPayment(debt.id)}
                              className="mt-3 rounded-xl border border-fuchsia-300/40 bg-fuchsia-500/10 px-3 py-2 text-xs font-semibold text-fuchsia-100"
                            >
                              Process payment
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-slate-200">No active financing contracts yet.</p>
                    )}
                  </div>
                </div>
  
                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                  <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
                    <img src={getItemDisplayImage(selected)} alt="" className="h-64 w-full object-cover" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selected.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-white">{selected.vendor}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200">{selected.quote || selected.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section key={selected.id} aria-label="Product details" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full min-w-0 overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-black/35 shadow-2xl shadow-fuchsia-950/20 backdrop-blur">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left: Large Product Image */}
              <div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-black/80 to-slate-900/80 p-8 min-h-[600px]">
                <div className="relative w-full max-w-md aspect-[1.1/1] rounded-3xl overflow-hidden border-2 border-cyan-300/20 shadow-lg">
                  <img src={getItemDisplayImage(selected)} alt={selected.name} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${selected.accent} opacity-30`} />
                </div>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {selected.tags.map((tag) => <Badge key={tag} className="border-cyan-300/30 bg-cyan-400/10 text-cyan-100">{tag}</Badge>)}
                </div>
                <div className="mt-6 flex flex-col items-center gap-2">
                  <span className="rounded-full border border-amber-300/40 bg-amber-400/10 px-4 py-1 text-lg font-bold text-amber-100 flex items-center gap-2">
                    {formatCurrency(getPriceValue(selected))}
                  </span>
                  <span className="rounded-full border border-purple-300/40 bg-purple-500/10 px-4 py-1 text-sm font-semibold text-purple-200">{selected.rarity}</span>
                </div>
              </div>
  
              {/* Right: Details */}
              <div className="flex flex-col gap-6 p-8">
                <div>
                  <p className="text-base font-semibold text-cyan-300 uppercase tracking-widest">{selected.subtitle}</p>
                  <h1 className="mt-2 text-5xl font-black tracking-tight text-white drop-shadow-sm">{selected.name}</h1>
                  <p className="mt-2 text-lg italic text-fuchsia-200">{selected.quote}</p>
                </div>
  
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-cyan-300/10 bg-black/30 p-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-cyan-300 mb-1">Category</div>
                    <div className="text-sm text-white">{selected.category}</div>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/10 bg-black/30 p-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-cyan-300 mb-1">Manufacturer</div>
                    <div className="text-sm text-white">{selected.manufacturer}</div>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/10 bg-black/30 p-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-cyan-300 mb-1">Rarity Tier</div>
                    <div className="text-sm text-white">{selected.rarity}</div>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/10 bg-black/30 p-4">
                    <div className="text-xs font-semibold uppercase tracking-widest text-cyan-300 mb-1">Attunement</div>
                    <div className="text-sm text-white">{selected.attunement}</div>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/10 bg-black/30 p-4 col-span-2">
                    <div className="text-xs font-semibold uppercase tracking-widest text-cyan-300 mb-1">Availability</div>
                    <div className="text-sm text-white">{selected.availability}</div>
                  </div>
                </div>
  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-500/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="h-5 w-5 text-fuchsia-200" />
                      <span className="text-lg font-bold text-fuchsia-200">Item Overview</span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{selected.description}</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-5 w-5 text-cyan-200" />
                      <span className="text-lg font-bold text-cyan-200">Potential Effects</span>
                    </div>
                    <ul className="space-y-2">
                      {selected.features.map((feature) => (
                        <li key={feature} className="flex gap-2 text-sm text-slate-100">
                          <ChevronRight className="h-4 w-4 text-fuchsia-300 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
  
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">Listing ID: {selected.id}</span>
                  <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white">Vendor: {selected.vendor}</span>
                </div>
  
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => handleToggleFavorite(selected.id)}
                    disabled={favoriteBusy || Boolean(profile && !wishLoaded)}
                    className="rounded-full border border-fuchsia-300/40 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {favoriteBusy ? "Saving..." : isFavorite(selected.id) ? "Favorited" : "Add to watchlist"}
                  </button>
                  <button
                    type="button"
                    onClick={() => addToCart(selected)}
                    className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                  >
                    Add to cart
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFinancingPage(true)}
                    className="rounded-full border border-amber-300/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20"
                  >
                    View financing
                  </button>
                </div>
  
                <div className="flex items-center gap-3 mt-6">
                  <div className="flex items-center gap-1 text-amber-300">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <span className="text-xs text-slate-300">{selected.rating ? `${selected.rating} verified rating` : "No ratings yet"}</span>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050815] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(0,215,255,.20),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(220,38,255,.16),transparent_28%),linear-gradient(180deg,#050815,#07111d_45%,#04040a)]" />
      <div className="fixed inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />

      <main className="relative mx-auto max-w-7xl overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-cyan-300/15 bg-black/30 p-5 shadow-2xl shadow-cyan-950/40 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10">
              <Sparkles className="h-7 w-7 text-cyan-300" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight"><span className="text-white">LUMA</span><span className="text-cyan-300">PRIME</span></div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Trade beyond worlds</p>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3 md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                aria-label="Search marketplace"
                value={query}
                onChange={(event) => updateSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && searchQuery) listingPanel.current?.scrollIntoView?.({ block: "start" });
                }}
                placeholder="Search relics, vendors, categories..." className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60" />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className={`rounded-2xl border p-3 transition ${showFilters ? "border-cyan-300/60 bg-cyan-400/15 text-cyan-100" : "border-white/10 bg-white/5 text-slate-200 hover:border-fuchsia-300/60"}`}
            >
              <Filter className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setShowCart((current) => !current)}
              className="relative rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/10 p-3 text-fuchsia-200 hover:bg-fuchsia-500/20"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-300 px-1 text-[10px] font-black text-slate-950">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>

          <div className="w-full rounded-2xl border border-cyan-300/20 bg-white/[0.03] p-3 md:max-w-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300">Player Session</p>
                <p className="text-xs text-slate-300">Secure LumaPrime account</p>
              </div>
              {sessionToken ? (
                <span className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-100">Online</span>
              ) : (
                <span className="rounded-full border border-amber-300/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-100">Offline</span>
              )}
            </div>

            {sessionToken && profile ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-100">Signed in as <span className="font-semibold text-white">{profile.username}</span></p>
                <p className="text-xs text-slate-300">Last login: {formatLoginDate(profile.lastLoginAt)}</p>
                {isDmAdmin ? (
                  <button type="button" onClick={() => setShowDmDashboard((visible) => !visible)} className="w-full rounded-xl border border-amber-300/40 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-400/20">
                    {showDmDashboard ? "Hide DM Dashboard" : "DM Dashboard"}
                  </button>
                ) : null}
                <button onClick={handleLogout} disabled={checkoutBusy} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/10">
                  Log out
                </button>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-2">
                <div className="flex gap-2 rounded-xl border border-white/10 bg-black/20 p-1">
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${authMode === "login" ? "bg-cyan-400/20 text-cyan-100" : "text-slate-200"}`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${authMode === "register" ? "bg-fuchsia-500/20 text-fuchsia-100" : "text-slate-200"}`}
                  >
                    Register
                  </button>
                </div>
                {authMode === "register" ? <input
                  type="text"
                  value={authForm.username}
                  onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))}
                  placeholder="Player name"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
                /> : null}
                <input
                  type="email"
                  autoComplete="email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="Email address"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
                />
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Password"
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
                />
                {authMode === "register" ? (
                  <input
                    type="password"
                    value={authForm.confirmPassword}
                    onChange={(event) => setAuthForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                    placeholder="Confirm password"
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
                  />
                ) : null}
                <button
                  type="submit"
                  disabled={loadingAuth}
                  className="w-full rounded-xl border border-cyan-300/30 bg-cyan-400/15 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loadingAuth ? "Working..." : authMode === "register" ? "Create account" : "Login"}
                </button>
                {status.message ? <p className={`text-xs ${status.tone === "warning" ? "text-rose-200" : status.tone === "success" ? "text-emerald-200" : "text-slate-200"}`}>{status.message}</p> : null}
              </form>
            )}
          </div>
        </header>

        {showFilters ? (
          <div className="mb-6 rounded-[2rem] border border-cyan-300/15 bg-black/35 p-5 backdrop-blur">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-300">Sort</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {[
                    { id: "featured", label: "Featured" },
                    { id: "price-low", label: "Price: Low to High" },
                    { id: "price-high", label: "Price: High to Low" }
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSortMode(option.id)}
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${sortMode === option.id ? "border-cyan-300/50 bg-cyan-400/15 text-cyan-100" : "border-white/10 bg-white/5 text-slate-100 hover:border-fuchsia-300/50"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-300">Tag filter</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tagOptions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${selectedTag === tag ? "border-fuchsia-300/60 bg-fuchsia-500/10 text-fuchsia-100" : "border-white/10 bg-white/5 text-slate-100 hover:border-cyan-300/50"}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-300">Rarity filter</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rarityOptions.map((rarity) => (
                      <button
                        key={rarity}
                        type="button"
                        onClick={() => setSelectedRarity(rarity)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${selectedRarity === rarity ? "border-amber-300/60 bg-amber-500/10 text-amber-100" : "border-white/10 bg-white/5 text-slate-100 hover:border-cyan-300/50"}`}
                      >
                        {rarity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {searchQuery && storefrontListings}

        {isDmAdmin && showDmDashboard && profile ? (
          <section className="mb-6 rounded-[2rem] border border-amber-300/30 bg-black/40 p-5" aria-label="DM Dashboard">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">DM Only</p>
            <h2 className="mt-2 text-2xl font-black text-white">LumaPrime DM Dashboard</h2>
            <p className="mt-2 text-sm text-slate-300">Generate a single-use Lumina deposit code. Supabase checks your administrator permission before issuing it.</p>
            <form onSubmit={generateDmDepositCode} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1 text-sm text-slate-200">
                Lumina amount
                <input type="number" min="1" max="1000000000" step="1" required value={dmDepositAmount} onChange={(event) => setDmDepositAmount(event.target.value)} className="mt-1 w-full rounded-xl border border-white/20 bg-black/30 px-3 py-2 text-white" />
              </label>
              <button type="submit" disabled={generatingDmCode} className="rounded-xl border border-amber-300/40 bg-amber-400/15 px-4 py-2 font-semibold text-amber-100 disabled:opacity-50">
                {generatingDmCode ? "Generating..." : "Generate Deposit Code"}
              </button>
            </form>
            {generatedDmCode ? (
              <div className="mt-4 rounded-xl border border-amber-300/30 bg-amber-400/5 p-3">
                <p className="text-xs text-amber-200">New code — copy and store it now. This code is shown only once.</p>
                <code className="mt-2 block break-all font-mono text-lg font-bold tracking-wider text-white">{generatedDmCode}</code>
                <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(generatedDmCode); setStatus({ message: "Code copied to clipboard.", tone: "success" }); } catch { setStatus({ message: "Copy failed. Select the code above and copy it manually.", tone: "warning" }); } }} className="mt-3 rounded-lg border border-white/20 px-3 py-2 text-sm text-white">Copy code</button>
              </div>
            ) : null}
            <FundingRequests key={profile.id} token={sessionToken} isDm />
            <div className="mt-6 border-t border-white/10 pt-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-white">Orders, Inventory & Transactions</h3>
                <button type="button" disabled={dmBusy} onClick={loadDmCommerce} className="rounded-xl border border-amber-300/40 px-4 py-2 text-sm text-amber-100">{dmBusy ? "Working..." : "Load / Refresh Commerce"}</button>
              </div>
              {dmOrderError && <p role="alert" className="text-sm text-rose-200">{dmOrderError}</p>}
              {dmCommerceNotice && <p role="status" className="text-sm text-emerald-200">{dmCommerceNotice}</p>}
              {dmOrders.length > 0 && <div className="space-y-2"><h4 className="font-semibold text-amber-100">Orders</h4>{dmOrders.map((o) => <div key={o.order_id} className="rounded-xl border border-white/10 p-3 text-sm text-white">
                <div className="flex flex-wrap justify-between gap-2"><span>{o.player_name} — {formatCurrency(o.order_total)}</span><span>{o.order_status}</span></div>
                <p className="text-xs text-slate-300">{o.order_items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
                {o.order_status === "completed" && (
                  <>
                    <DeliveryEditor key={`${o.order_id}-${o.delivery_status}-${o.delivery_estimate}`} order={o} busy={dmBusy} onSave={updateDelivery} />
                    <OrderRefund order={o} busy={dmBusy} onRefund={refundOrder} />
                  </>
                )}
                {o.refund_reason && <p className="mt-2 text-sm text-slate-300">Refund reason: {o.refund_reason}</p>}
                {o.order_status === "pending_approval" && <div className="mt-2 flex gap-2"><button disabled={dmBusy} onClick={() => reviewDmOrder(o.order_id,true)} className="rounded-lg border border-emerald-300/50 px-3 py-1">Approve</button><button disabled={dmBusy} onClick={() => reviewDmOrder(o.order_id,false)} className="rounded-lg border border-rose-300/50 px-3 py-1">Reject & Refund</button></div>}
              </div>)}</div>}
              <section className="space-y-2" aria-label="Manage listings">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-amber-100">Manage listings</h4>
                  <button type="button" className={accountButton} onClick={() => setEditingListing({})} disabled={Boolean(editingListing)}>Add listing</button>
                </div>
                {editingListing && (
                  <ListingEditor key={editingListing.product_id || "new"} product={editingListing.product_id ? editingListing : null}
                    original={originalItems.find((item) => item.id === editingListing.product_id)}
                    onSave={saveListing} onClose={() => setEditingListing(null)} />
                )}
                <div className="max-h-64 space-y-1 overflow-y-auto">
                  {inventory.map((product) => (
                    <div key={product.product_id} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 p-2 text-sm">
                      <span>{product.product_name} · {formatCurrency(product.price)} · {product.stock_quantity === null ? "Unlimited" : `${product.stock_quantity} left`}{product.requires_dm_approval ? " · Approval" : ""}{product.is_active ? "" : " · Hidden"}</span>
                      <button type="button" className={accountButton} onClick={() => setEditingListing(product)} disabled={Boolean(editingListing)} aria-label={`Edit ${product.product_name}`}>Edit</button>
                    </div>
                  ))}
                </div>
              </section>
              {dmTransactions.length > 0 && <div><h4 className="mb-2 font-semibold text-amber-100">Recent Transactions</h4><div className="max-h-64 space-y-1 overflow-y-auto">{dmTransactions.map((t) => <div key={t.transaction_id} className="flex justify-between gap-2 border-b border-white/10 py-2 text-xs text-slate-200"><div><p>{t.player_name} · {t.transaction_type === "dm_adjustment" ? "Wallet adjustment" : t.transaction_type} · {new Date(t.created_at).toLocaleString()}</p>{t.description && <p className="mt-1 text-slate-300">{t.description}</p>}</div><span>{formatCurrency(t.amount)}</span></div>)}</div></div>}
            </div>
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">Player Management</h3>
                  <p className="mt-1 text-xs text-slate-300">View player balances and record corrections.</p>
                </div>
                <button type="button" onClick={loadDmPlayers} disabled={loadingDmPlayers} className="rounded-xl border border-amber-300/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100 disabled:opacity-50">
                  {loadingDmPlayers ? "Loading..." : dmPlayers.length ? "Refresh players" : "Load players"}
                </button>
              </div>
              {dmWalletNotice && <p role="status" className="mt-2 text-sm text-emerald-200">{dmWalletNotice}</p>}
              {adjustingPlayer && (
                <WalletAdjustment key={adjustingPlayer.player_id} player={adjustingPlayer} onSave={adjustPlayerWallet} onClose={() => setAdjustingPlayer(null)} />
              )}
              {dmPlayersError ? <p role="alert" className="mt-3 text-sm text-rose-300">Could not load players: {dmPlayersError}</p> : null}
              {dmPlayers.length ? (
                <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full min-w-[440px] text-left text-sm">
                    <thead className="bg-white/10 text-xs uppercase tracking-wider text-amber-100">
                      <tr><th className="px-3 py-3">Player</th><th className="px-3 py-3">Lumina</th><th className="px-3 py-3">Joined</th><th className="px-3 py-3">Wallet</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-slate-100">
                      {dmPlayers.map((player) => (
                        <tr key={player.player_id}>
                          <td className="px-3 py-3">{player.player_name || "Adventurer"}</td>
                          <td className="px-3 py-3 font-semibold">{Number(player.balance).toLocaleString()} Lumina</td>
                          <td className="px-3 py-3">{player.joined_at ? new Date(player.joined_at).toLocaleDateString() : "—"}</td>
                          <td className="px-3 py-3"><button type="button" className={accountButton} disabled={Boolean(adjustingPlayer)} onClick={() => {
                            setDmWalletNotice("");
                            setAdjustingPlayer(player);
                          }}>Adjust</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : !loadingDmPlayers && !dmPlayersError ? <p className="mt-3 text-xs text-slate-400">Select Load players to view registered accounts.</p> : null}
            </div>
          </section>
        ) : null}

        <section className="mb-6 grid gap-4 xl:grid-cols-[1.15fr_1fr]">
          <section className="rounded-[2rem] border border-cyan-300/15 bg-black/30 p-5 backdrop-blur" aria-labelledby="player-dashboard-label">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p id="player-dashboard-label" className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-300">Player Dashboard</p>
                <h2 className="mt-2 text-2xl font-black text-white">{profile ? `${profile.username}'s profile` : "Guest traveler"}</h2>
              </div>
              {sessionToken && profile ? (
                <span className="rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">Active</span>
              ) : (
                <span className="rounded-full border border-amber-300/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-100">Guest</span>
              )}
            </div>

            {!profile ? (
              <p className="text-sm leading-relaxed text-slate-200">Create an account or log in to save favorites, view your watchlist, and unlock badges that grow with your playstyle.</p>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Favorites</p>
                    <p className="mt-2 text-2xl font-bold text-fuchsia-100">{favorites.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Member since</p>
                    <p className="mt-2 text-sm font-semibold text-slate-100">{formatLoginDate(profile.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Profile badges</p>
                  <div className="flex flex-wrap gap-2">
                    {badgeList.length ? badgeList.map((badge) => <Badge key={badge.name} className={`${badge.tone}`}>{badge.name}</Badge>) : <Badge className="border-white/10 bg-white/5 text-slate-200">No badges yet</Badge>}
                  </div>
                </div>

                <button type="button" className={`w-full ${accountButton}`} aria-expanded={showOrders} aria-controls={showOrders ? "my-orders" : undefined} onClick={() => setShowOrders((visible) => !visible)}>
                  {showOrders ? "Hide My Orders & Deliveries" : "My Orders & Deliveries"}
                </button>
                {showOrders && <MyOrders key={`${profile.id}-${ordersRevision}`} token={sessionToken} />}
              </div>
            )}

            <div className="mt-4 rounded-[2rem] border border-cyan-300/15 bg-slate-950/60 p-5 backdrop-blur">
              <h3 className="text-sm font-bold text-cyan-100">Lumina Wallet</h3>
              <p className="mt-2 text-2xl font-bold text-white">{profile ? formatCurrency(current.wallet) : "Sign in to see your balance"}</p>
              <p className="mt-1 text-xs text-slate-300">Refresh the page to see balance changes made by your DM.</p>

              <form onSubmit={redeemDepositCode} className="mt-4 space-y-3 rounded-2xl border border-amber-300/25 bg-amber-400/5 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-200">Load Lumina</p>
                  <p className="mt-1 text-xs text-slate-300">Redeem a one-time deposit code issued by your DM. Each code works only once.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    autoComplete="off"
                    value={depositCode}
                    onChange={(event) => setDepositCode(event.target.value)}
                    placeholder="Enter your deposit code"
                    aria-label="Lumina deposit code"
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300/60"
                  />
                  <button
                    type="submit"
                    disabled={!profile || redeemingCode || !depositCode.trim()}
                    className="rounded-xl border border-amber-300/40 bg-amber-400/15 px-4 py-2 text-sm font-semibold text-amber-100 disabled:opacity-50"
                  >
                    {redeemingCode ? "Redeeming..." : "Redeem code"}
                  </button>
                </div>
              </form>

              {walletNotice && (
                <p role={walletNotice.error ? "alert" : "status"} className={`mt-2 text-sm ${walletNotice.error ? "text-rose-200" : "text-emerald-200"}`}>{walletNotice.text}</p>
              )}
              {profile && <FundingRequests key={profile.id} token={sessionToken} />}
            </div>
          </section>

          <div className="rounded-[2rem] border border-amber-300/15 bg-amber-400/5 p-5 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-200">Wish Vault</p>
            {wishError && (
              <div className="mt-2 space-y-2">
                <p role="alert" className="text-sm text-rose-200">{wishError}</p>
                <button type="button" className={accountButton} onClick={() => setWishRevision((revision) => revision + 1)}>Refresh Wish Vault</button>
              </div>
            )}
            {profile && !wishLoaded && !wishError && <p role="status" className="mt-2 text-sm text-slate-300">Loading Wish Vault…</p>}
            <div className="mt-3 space-y-2">
              {favorites.length ? (
                favorites.map((itemId) => {
                  const item = items.find((entry) => entry.id === itemId);
                  return item ? (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        <p className="text-xs text-slate-300">{formatCurrency(getPriceValue(item))}</p>
                      </div>
                      <button onClick={() => openListing(item.id)} className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">View</button>
                    </div>
                  ) : null;
                })
              ) : (
                (!profile || wishLoaded) && <p className="text-sm text-slate-300">{profile ? "Your Wish Vault is empty." : "Sign in to open your Wish Vault."}</p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-fuchsia-300/15 bg-fuchsia-500/5 p-5 backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-fuchsia-200">Current Bulletin</p>
                <h2 className="mt-2 text-xl font-black text-white">Market updates and field notices</h2>
              </div>
              <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-fuchsia-100">Live feed</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {worldNotices.map((notice) => (
                <WorldNoticeCard key={notice.title} badge={notice.badge} title={notice.title} copy={notice.copy} tone={notice.tone} />
              ))}
            </div>
          </div>
        </section>

        {!searchQuery && storefrontListings}

        {showCart ? (
          <div className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowCart(false)}>
            <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#050815] p-5 shadow-2xl shadow-fuchsia-950/30" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-300">Shopping Cart</p>
                  <h2 className="mt-2 text-xl font-black text-white">Your current haul</h2>
                </div>
                <button type="button" onClick={() => setShowCart(false)} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {checkoutMessage && (
                <p role={checkoutMessage.success ? "status" : "alert"} className={`mt-4 text-sm ${checkoutMessage.success ? "text-emerald-200" : "text-rose-200"}`}>
                  {checkoutMessage.text}
                </p>
              )}
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                {cart.length ? (
                  <div className="space-y-3">
                    {cartLines.map((entry) => (
                      <div key={entry.item.id} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{entry.item.name}</p>
                            <p className="text-xs text-slate-300">{formatCurrency(entry.unitPrice)} each</p>
                            {entry.product?.requires_dm_approval && <p className="text-xs text-amber-200">Requires DM approval</p>}
                            {entry.product && (
                              <p className="text-xs text-slate-300">
                                {entry.product.is_active
                                  ? entry.product.stock_quantity === null ? "Unlimited stock" : `${entry.product.stock_quantity} available`
                                  : "Unavailable"}
                              </p>
                            )}
                          </div>
                          <button type="button" onClick={() => removeFromCart(entry.item.id)} disabled={checkoutBusy} className="text-xs text-rose-200">Remove</button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => updateCartQuantity(entry.item.id, -1)} disabled={checkoutBusy} className="rounded-full border border-white/10 bg-white/5 p-1 text-slate-100">
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold text-white">{entry.quantity}</span>
                            <button type="button" onClick={() => updateCartQuantity(entry.item.id, 1)} disabled={checkoutBusy} className="rounded-full border border-white/10 bg-white/5 p-1 text-slate-100">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-cyan-100">{formatCurrency(entry.unitPrice * entry.quantity)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3">
                      {hasPurchase && (
                        <div className="flex justify-between gap-2 text-sm text-slate-100">
                          <span>Purchase now</span><strong>{formatCurrency(purchaseTotal)}</strong>
                        </div>
                      )}
                      {hasRequest && (
                        <div className="flex justify-between gap-2 text-sm text-amber-100">
                          <span>Reserve for DM approval</span><strong>{formatCurrency(reservationTotal)}</strong>
                        </div>
                      )}
                      {hasPurchase && hasRequest && (
                        <div className="mt-2 flex justify-between gap-2 border-t border-white/15 pt-2 text-sm text-white">
                          <span>Total from wallet</span><strong>{formatCurrency(purchaseTotal + reservationTotal)}</strong>
                        </div>
                      )}
                      {hasRequest && <p className="mt-2 text-xs text-slate-300">Rejected requests return the reserved Lumina to your wallet.</p>}
                    </div>
                    {!cartReady && !retry && (
                      <div className="flex items-center justify-between gap-3 text-xs text-amber-100">
                        <p>Check availability and quantities before checkout.</p>
                        <button type="button" onClick={loadInventory} disabled={checkoutBusy} className="underline">Refresh stock</button>
                      </div>
                    )}
                    {!profile && <p className="text-xs text-slate-300">Sign in to check out.</p>}
                    <div className="flex gap-2">
                      <button type="button" disabled={checkoutBusy} onClick={clearCart} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100">Clear cart</button>
                      <button type="button" onClick={checkoutCart} disabled={checkoutBusy || !profile || (!cartReady && !retry)} className="flex-1 rounded-xl border border-cyan-300/40 bg-cyan-400/15 px-3 py-2 text-sm font-semibold text-cyan-100 disabled:opacity-50">{checkoutBusy ? "Processing..." : retry ? "Retry Checkout" : "Secure Checkout"}</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed text-slate-200">Your cart is empty. Add a few listings to keep your order ready.</p>
                    <button type="button" onClick={() => setShowCart(false)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100">Keep browsing</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
