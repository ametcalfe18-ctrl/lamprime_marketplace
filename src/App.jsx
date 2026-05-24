import React, { useMemo, useState } from "react";
import { Search, ShoppingCart, Star, ShieldCheck, Sparkles, Leaf, AlertTriangle, CreditCard, Truck, Heart, Filter, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  {
    id: "LP-4F7B-88C3",
    name: "Pollen Pipe",
    subtitle: "Arcane Botanical Pipe",
    tagline: "Breathe the bloom between realities.",
    category: "Arcane Botanical Tools",
    manufacturer: "Unknown — rumored nature-bound artificers of Kutune",
    rarity: "Rare",
    attunement: "Not Required",
    price: "6,250 – 8,750 Lumina",
    availability: "Limited circulation through herbalists, explorers, and black-market alchemists",
    vendor: "The Green Silence Collective",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1200&q=80",
    accent: "from-fuchsia-500 to-emerald-400",
    description:
      "Crafted from living rootwood and a naturally grown blossom, the Pollen Pipe filters harsh air into calming, vision-brightening vapor. Each draw releases a soft bloom of luminous pollen that steadies the mind and carries whispers of the wild.",
    features: [
      "Once per day: gain advantage on one Wisdom (Perception or Insight) check.",
      "Natural Trance: gain resistance to poison damage for 1 hour.",
      "Nature’s Whisper: communicate with plants for 10 minutes.",
      "Side Effect: overuse may cause vivid dreams or mild hallucinations."
    ],
    tags: ["Natural Origin", "Vision Enhancing", "Poison Resistance", "Plant Communication"],
    quote: "The forest speaks through the pollen, and those who listen breathe deeper truths."
  },
  {
    id: "LP-NAV-4112",
    name: "Monster Compass",
    subtitle: "Threat Detection Compass",
    tagline: "Fear has a direction.",
    category: "Threat Detection & Arcane Navigation Tools",
    manufacturer: "Unknown — rumored Obsidian Shipwright and Hishnaliad hybrid engineering",
    rarity: "Rare",
    attunement: "Required",
    price: "14,000 – 18,500 Lumina",
    availability: "Extremely limited circulation through bounty guilds, salvagers, and black-market relic brokers",
    vendor: "Ghost Pier Recovery Office",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    accent: "from-red-500 to-yellow-400",
    description:
      "This eye-like compass points toward the nearest hostile creature. As the threat grows stronger, the iris darkens and dilates. Hunters call it the Blinking Warning. Sensible captains call it cursed.",
    features: [
      "Tracks the nearest hostile creature within range.",
      "Iris dilation indicates threat severity.",
      "Sensitive to Sin Resonance and Fold anomalies.",
      "Long-term use may cause paranoia and auditory whispers."
    ],
    tags: ["Threat Tracking", "Bounty Gear", "Restricted", "Resonance Sensitive"],
    quote: "It pointed at my crew three seconds before the betrayal. Five stars."
  },
  {
    id: "LP-NEC-9037",
    name: "Draft of Zombification",
    subtitle: "Rare Necro-Alchemical Draft",
    tagline: "Walk among the dead — and pray they do not notice you breathing.",
    category: "Biological Resonance Consumables",
    manufacturer: "Unknown — rumored Grave Choir necro-alchemists",
    rarity: "Rare",
    attunement: "Not Required",
    price: "2,400 – 5,000 Lumina per vial",
    availability: "Restricted circulation through plague runners, tomb raiders, and Ghost Pier brokers",
    vendor: "Soul Apothecary Black Counter",
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80",
    accent: "from-lime-500 to-slate-400",
    description:
      "A foul necro-alchemical potion that temporarily alters the user’s body signature to mimic undeath. Useful in tombs, plague zones, and situations where smelling alive is a liability.",
    features: [
      "Transforms appearance to rotten and corpse-like for 3 hours.",
      "Gain 20 temporary hit points.",
      "Undead with Intelligence below 14 treat you as one of their own.",
      "Immune to poison; all healing effects are reduced by half."
    ],
    tags: ["Necro-Alchemy", "Undead Zones", "Biohazard", "Restricted"],
    quote: "Worst taste in the galaxy. Saved my life twice."
  }
];

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

function ProductCard({ item, selected, onClick }) {
  return (
    <button onClick={onClick} className={`group w-full overflow-hidden rounded-2xl border text-left transition ${selected ? "border-fuchsia-400/70 bg-fuchsia-400/10" : "border-white/10 bg-white/[0.03] hover:border-cyan-300/50 hover:bg-white/[0.06]"}`}>
      <div className="relative h-28 overflow-hidden">
        <img src={item.image} alt="" className="h-full w-full object-cover opacity-60 transition group-hover:scale-105" />
        <div className={`absolute inset-0 bg-gradient-to-t ${item.accent} opacity-35`} />
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-sm font-bold text-white">{item.name}</p>
          <p className="text-xs text-slate-200">{item.price}</p>
        </div>
      </div>
    </button>
  );
}

export default function LumaPrimeMarketplace() {
  const [selectedId, setSelectedId] = useState(items[0].id);
  const [query, setQuery] = useState("");
  const selected = items.find((item) => item.id === selectedId) || items[0];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => [item.name, item.category, item.rarity, item.vendor, ...item.tags].join(" ").toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen bg-[#050815] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(0,215,255,.20),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(220,38,255,.16),transparent_28%),linear-gradient(180deg,#050815,#07111d_45%,#04040a)]" />
      <div className="fixed inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />

      <main className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search relics, vendors, categories..." className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60" />
            </div>
            <button className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 hover:border-fuchsia-300/60">
              <Filter className="h-5 w-5" />
            </button>
            <button className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/10 p-3 text-fuchsia-200 hover:bg-fuchsia-500/20">
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-cyan-300">Active Listings</p>
              <div className="space-y-3">
                {filtered.map((item) => (
                  <ProductCard key={item.id} item={item} selected={item.id === selected.id} onClick={() => setSelectedId(item.id)} />
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-300/20 bg-amber-400/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-200"><AlertTriangle className="h-4 w-4" /><span className="text-sm font-semibold">Customs Advisory</span></div>
              <p className="text-xs leading-relaxed text-slate-300">Items marked restricted may trigger port scans, Arrival Visa review, or confiscation in Pearl-controlled territories.</p>
            </div>
          </aside>

          <motion.section key={selected.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-black/35 shadow-2xl shadow-fuchsia-950/20 backdrop-blur">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_.95fr]">
              <div className="p-6 sm:p-8">
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge className="border-purple-300/30 bg-purple-500/10 text-purple-200">{selected.rarity}</Badge>
                  <Badge>{selected.category}</Badge>
                  <Badge>{selected.attunement}</Badge>
                </div>

                <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">{selected.subtitle}</p>
                <h1 className="mt-2 text-5xl font-black tracking-tight sm:text-7xl">{selected.name}</h1>
                <p className={`mt-4 bg-gradient-to-r ${selected.accent} bg-clip-text text-xl font-semibold italic text-transparent`}>{selected.tagline}</p>

                <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <StatRow label="Category" value={selected.category} />
                  <StatRow label="Manufacturer" value={selected.manufacturer} />
                  <StatRow label="Rarity Tier" value={selected.rarity} />
                  <StatRow label="Attunement" value={selected.attunement} />
                  <StatRow label="Price Range" value={selected.price} />
                  <StatRow label="Availability" value={selected.availability} />
                </div>
              </div>

              <div className="relative min-h-[460px] overflow-hidden border-l border-cyan-300/10 bg-slate-950/70">
                <img src={selected.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
                <div className={`absolute inset-0 bg-gradient-to-br ${selected.accent} opacity-30 mix-blend-screen`} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050815] via-transparent to-transparent" />
                <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
                  <div className="self-end rounded-3xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur">
                    <div className="flex items-center gap-1 text-amber-300">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                    </div>
                    <p className="mt-1 text-xs text-slate-300">{selected.rating} verified rating</p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/45 p-5 backdrop-blur">
                    <p className="text-xs uppercase tracking-widest text-slate-400">Vendor</p>
                    <p className="mt-1 text-lg font-bold text-white">{selected.vendor}</p>
                    <p className="mt-3 text-xs text-slate-300">Listing ID: {selected.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 border-t border-cyan-300/10 p-6 sm:p-8 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-fuchsia-200"><Leaf className="h-5 w-5" /> Item Overview</h2>
                <p className="leading-relaxed text-slate-200">{selected.description}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-cyan-200"><ShieldCheck className="h-5 w-5" /> Potential Effects</h2>
                <div className="space-y-3">
                  {selected.features.map((feature) => (
                    <div key={feature} className="flex gap-3 text-sm leading-relaxed text-slate-200">
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-300" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 px-6 pb-6 sm:px-8 sm:pb-8 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-3xl border border-purple-300/15 bg-purple-500/5 p-5">
                <p className="text-lg italic text-purple-100">“{selected.quote}”</p>
                <p className="mt-3 text-xs text-slate-400">— Verified LumaPrime buyer</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-4 grid grid-cols-3 gap-3 text-center text-xs text-slate-300">
                  <div className="rounded-2xl bg-white/5 p-3"><CreditCard className="mx-auto mb-2 h-5 w-5 text-amber-300" /> Financing</div>
                  <div className="rounded-2xl bg-white/5 p-3"><Truck className="mx-auto mb-2 h-5 w-5 text-cyan-300" /> Ghost Route</div>
                  <div className="rounded-2xl bg-white/5 p-3"><Heart className="mx-auto mb-2 h-5 w-5 text-fuchsia-300" /> Watchlist</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
