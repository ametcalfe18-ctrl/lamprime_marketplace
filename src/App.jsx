import React, { useEffect, useMemo, useState } from "react";
import { Search, ShoppingCart, Star, ShieldCheck, Sparkles, Leaf, AlertTriangle, CreditCard, Truck, Heart, Filter, ChevronRight, Plus, Minus, X, Coins, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { marketplaceItems as items } from "./data/items";

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
  if (!response.ok) throw new Error(data.msg || data.error_description || data.message || data.error || "Account request failed");
  return data;
}

function localFavorites(userId) {
  try {
    const result = JSON.parse(localStorage.getItem(`luma-prime-favorites-${userId}`) || "[]");
    return Array.isArray(result) ? result : [];
  } catch { return []; }
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

function ProductCard({ item, selected, onClick, isFavorite, onToggleFavorite, onAddToCart, className = "" }) {
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
  const subtitle = `${item.rarity || "Unknown"} • ${item.category || "Curio"}`;

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

function getAllTags() {
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
  const [selectedId, setSelectedId] = useState(items[0].id);
  const [query, setQuery] = useState("");
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
  const [loadingDmPlayers, setLoadingDmPlayers] = useState(false);
  const [dmPlayersError, setDmPlayersError] = useState("");
  const [depositCode, setDepositCode] = useState("");
  const [redeemingCode, setRedeemingCode] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [status, setStatus] = useState({ message: "Log in to save favorites and unlock your dashboard.", tone: "info" });
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [ddbSyncing, setDdbSyncing] = useState(false);
  const [ddbSheetUrl, setDdbSheetUrl] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    try {
      return window.localStorage.getItem("luma-prime-ddb-sheet-url") || "";
    } catch {
      return "";
    }
  });
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
  const selected = items.find((item) => item.id === selectedId) || items[0];

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

    window.localStorage.setItem("luma-prime-ddb-sheet-url", ddbSheetUrl);
  }, [ddbSheetUrl]);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const nextItems = items.filter((item) => {
      const haystack = [item.name, item.category, item.rarity, item.vendor, ...item.tags].join(" ").toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesTag = selectedTag === "All" || item.tags.includes(selectedTag);
      const matchesRarity = selectedRarity === "All" || item.rarity === selectedRarity;
      return matchesQuery && matchesTag && matchesRarity;
    });

    if (sortMode === "price-low") {
      return [...nextItems].sort((a, b) => getPriceValue(a) - getPriceValue(b));
    }

    if (sortMode === "price-high") {
      return [...nextItems].sort((a, b) => getPriceValue(b) - getPriceValue(a));
    }

    return nextItems;
  }, [query, selectedTag, selectedRarity, sortMode]);

  const isFavorite = (itemId) => favorites.includes(itemId);
  const badgeList = useMemo(() => deriveBadges(profile, favorites.length), [profile, favorites.length]);
  const cartCount = cart.reduce((total, entry) => total + entry.quantity, 0);
  const cartTotal = cart.reduce((total, entry) => total + getPriceValue(entry.item) * entry.quantity, 0);
  const tagOptions = ["All", ...getAllTags()];
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

    if (selected.category.includes("Healing") || selected.tags.includes("Rest") || selected.tags.includes("Wellness")) {
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
  }, [cartCount, current.wallet, financedItems.length, favorites.length, profile, selected.category, selected.name, selected.tags]);

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
        setFavorites(localFavorites(user.id));
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
    try {
      const newBalance = await supabaseRequest("/rest/v1/rpc/redeem_lumina_code", {
        method: "POST",
        token: sessionToken,
        body: { entered_code: code }
      });
      if (!Number.isSafeInteger(newBalance) || newBalance < 0) {
        throw new Error("Redemption response was unexpected. Refresh and check your wallet.");
      }
      setWalletBalance(newBalance);
      setDepositCode("");
      setStatus({ message: `Deposit redeemed! Your wallet now holds ${formatCurrency(newBalance)}.`, tone: "success" });
    } catch (error) {
      setStatus({ message: `Code redemption failed: ${error.message}`, tone: "warning" });
    } finally {
      setRedeemingCode(false);
    }
  };

  const syncDndBeyondGold = async (event) => {
    event.preventDefault();
    setStatus({ message: "D&D Beyond wallet syncing is temporarily unavailable while we build secure verification. It cannot add Lumina yet.", tone: "warning" });
  };

  const handleToggleFavorite = async (itemId) => {
    if (!sessionToken || !profile) {
      setStatus({ message: "Log in to save favorites.", tone: "warning" });
      return;
    }
    // Device-local until a secured, shared Wish Vault is implemented.
    const next = favorites.includes(itemId) ? favorites.filter((id) => id !== itemId) : [...favorites, itemId];
    localStorage.setItem(`luma-prime-favorites-${profile.id}`, JSON.stringify(next));
    setFavorites(next);
    setStatus({ message: "Wish Vault updated on this device.", tone: "success" });
  };

  const addToCart = (item) => {
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
    setCart((current) => current.filter((entry) => entry.item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setStatus({ message: "Your cart is empty.", tone: "info" });
  };

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
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search relics, vendors, categories..." className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60" />
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
                <button onClick={handleLogout} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/10">
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
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">Player Management</h3>
                  <p className="mt-1 text-xs text-slate-300">Read-only list of registered players and their current Lumina balances.</p>
                </div>
                <button type="button" onClick={loadDmPlayers} disabled={loadingDmPlayers} className="rounded-xl border border-amber-300/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100 disabled:opacity-50">
                  {loadingDmPlayers ? "Loading..." : dmPlayers.length ? "Refresh players" : "Load players"}
                </button>
              </div>
              {dmPlayersError ? <p role="alert" className="mt-3 text-sm text-rose-300">Could not load players: {dmPlayersError}</p> : null}
              {dmPlayers.length ? (
                <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full min-w-[440px] text-left text-sm">
                    <thead className="bg-white/10 text-xs uppercase tracking-wider text-amber-100">
                      <tr><th className="px-3 py-3">Player</th><th className="px-3 py-3">Lumina</th><th className="px-3 py-3">Joined</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-slate-100">
                      {dmPlayers.map((player) => (
                        <tr key={player.player_id}>
                          <td className="px-3 py-3">{player.player_name || "Adventurer"}</td>
                          <td className="px-3 py-3 font-semibold">{Number(player.balance).toLocaleString()} Lumina</td>
                          <td className="px-3 py-3">{player.joined_at ? new Date(player.joined_at).toLocaleDateString() : "—"}</td>
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
          <div className="rounded-[2rem] border border-cyan-300/15 bg-black/30 p-5 backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-300">Player Dashboard</p>
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
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Logins</p>
                    <p className="mt-2 text-2xl font-bold text-cyan-100">{profile.loginCount}</p>
                  </div>
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
              </div>
            )}

            <div className="mt-4 rounded-[2rem] border border-cyan-300/15 bg-slate-950/60 p-5 backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-300">D&D Beyond wallet link</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">D&D Beyond syncing is temporarily unavailable until we can verify character funds securely. It will not change your Lumina wallet.</p>
                </div>
                <span className="rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-100">{"Sync pending"}</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">LumaPrime wallet</p>
                  <p className="mt-2 text-2xl font-bold text-white">{formatCurrency(current.wallet)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">D&D Beyond gold</p>
                  <p className="mt-2 text-2xl font-bold text-cyan-100">{"Not connected"}</p>
                </div>
              </div>

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

              <form onSubmit={syncDndBeyondGold} className="mt-4 grid gap-2 md:grid-cols-[1fr_auto]">
                <input
                  type="url"
                  value={ddbSheetUrl}
                  onChange={(event) => setDdbSheetUrl(event.target.value)}
                  placeholder="https://www.dndbeyond.com/profile/yourname/characters/123456"
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
                />
                <button
                  type="submit"
                  disabled
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <RefreshCw className={`h-4 w-4 ${ddbSyncing ? "animate-spin" : ""}`} />
                  {"Sync unavailable"}
                </button>
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <Coins className="h-4 w-4 text-amber-200" />
                <span>Secure D&D Beyond syncing is not enabled yet.</span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-amber-300/15 bg-amber-400/5 p-5 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-200">Saved Favorites</p>
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
                      <button onClick={() => setSelectedId(item.id)} className="rounded-xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">View</button>
                    </div>
                  ) : null;
                })
              ) : (
                <p className="text-sm leading-relaxed text-slate-200">Your watchlist is empty. Save a few listings to keep them close at hand.</p>
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

        <div className="grid w-full min-w-0 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="w-full min-w-0 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-300">Active Listings</p>
              <div className="listing-scrollbar w-full min-w-0 overflow-x-auto pb-2 snap-x snap-mandatory">
                <div className="flex w-max gap-3">
                  {filtered.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      selected={item.id === selected.id}
                      isFavorite={isFavorite(item.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onAddToCart={addToCart}
                      onClick={() => setSelectedId(item.id)}
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

          {showFinancingPage ? (
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
            <motion.section key={selected.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="w-full min-w-0 overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-black/35 shadow-2xl shadow-fuchsia-950/20 backdrop-blur">
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
                      disabled={favoriteBusy}
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
                    <span className="text-xs text-slate-300">{selected.rating} verified rating</span>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </div>

        {showCart ? (
          <div className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowCart(false)}>
            <div className="absolute inset-y-0 right-0 w-full max-w-md border-l border-white/10 bg-[#050815] p-5 shadow-2xl shadow-fuchsia-950/30" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-300">Shopping Cart</p>
                  <h2 className="mt-2 text-xl font-black text-white">Your current haul</h2>
                </div>
                <button type="button" onClick={() => setShowCart(false)} className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-100">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                {cart.length ? (
                  <div className="space-y-3">
                    {cart.map((entry) => (
                      <div key={entry.item.id} className="rounded-2xl border border-white/10 bg-black/25 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{entry.item.name}</p>
                            <p className="text-xs text-slate-300">{formatCurrency(getPriceValue(entry.item))} each</p>
                          </div>
                          <button type="button" onClick={() => removeFromCart(entry.item.id)} className="text-xs text-rose-200">Remove</button>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => updateCartQuantity(entry.item.id, -1)} className="rounded-full border border-white/10 bg-white/5 p-1 text-slate-100">
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold text-white">{entry.quantity}</span>
                            <button type="button" onClick={() => updateCartQuantity(entry.item.id, 1)} className="rounded-full border border-white/10 bg-white/5 p-1 text-slate-100">
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-cyan-100">{formatCurrency(getPriceValue(entry.item) * entry.quantity)}</p>
                        </div>
                      </div>
                    ))}
                    <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-3">
                      <div className="flex items-center justify-between text-sm text-slate-100">
                        <span>Total</span>
                        <span className="font-bold text-white">{formatCurrency(cartTotal)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={clearCart} className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100">Clear cart</button>
                      <button type="button" disabled title="Secure checkout is being built" className="flex-1 cursor-not-allowed rounded-xl border border-cyan-300/20 bg-cyan-400/5 px-3 py-2 text-sm font-semibold text-slate-400">Checkout coming soon</button>
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
