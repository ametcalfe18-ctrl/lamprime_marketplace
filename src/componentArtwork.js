// Bundled LumaPrime reagent photos, keyed by catalog product ID.
const artworkFiles = import.meta.glob("./component-*.webp", {
  eager: true,
  import: "default",
  query: "?url"
});

const productIdsByArtwork = {
  "agate": [
    "LP-COMP-2024-AWAKEN",
  ],
  "bark": [
    "LP-COMP-2024-BARKSKIN",
  ],
  "bat-guano": [
    "LP-COMP-2024-DELAYED-BLAST-FIREBALL",
    "LP-COMP-2024-FIREBALL",
    "LP-COMP-GUANO",
  ],
  "bell": [
    "LP-COMP-2024-ALARM",
    "LP-COMP-BELL",
  ],
  "bitumen": [
    "LP-COMP-2024-SPIDER-CLIMB",
  ],
  "bowl": [
    "LP-COMP-2024-HEROES-FEAST",
  ],
  "butter": [
    "LP-COMP-2024-GREASE",
  ],
  "candle": [
    "LP-COMP-2024-WIND-WALK",
  ],
  "carrot": [
    "LP-COMP-2024-DARKVISION",
  ],
  "charcoal": [
    "LP-COMP-2024-WALL-OF-FIRE",
  ],
  "chest": [
    "LP-COMP-2024-SECRET-CHEST",
  ],
  "chili": [
    "LP-COMP-2024-DRAGONS-BREATH",
  ],
  "clay": [
    "LP-COMP-2024-EARTHQUAKE",
    "LP-COMP-2024-STONE-SHAPE",
    "LP-COMP-2024-WALL-OF-ICE",
    "LP-COMP-2024-WALL-OF-STONE",
  ],
  "clone-vessel": [
    "LP-COMP-2024-CLONE",
    "LP-COMP-CLONE-V",
  ],
  "cloth": [
    "LP-COMP-2024-AID",
    "LP-COMP-2024-ARCANISTS-MAGIC-AURA",
  ],
  "coal": [
    "LP-COMP-PART-DARKNESS-COAL",
  ],
  "cocoon": [
    "LP-COMP-2024-POLYMORPH",
  ],
  "copper-coins": [
    "LP-COMP-2024-DETECT-THOUGHTS",
    "LP-COMP-2024-GENTLE-REPOSE",
  ],
  "copper-wire": [
    "LP-COMP-2024-MESSAGE",
    "LP-COMP-2024-SENDING",
  ],
  "cork": [
    "LP-COMP-2024-WATER-WALK",
  ],
  "crystal-ball": [
    "LP-COMP-2024-FREEZING-SPHERE",
    "LP-COMP-2024-GLOBE-OF-INVULNERABILITY",
    "LP-COMP-2024-RESILIENT-SPHERE",
    "LP-COMP-2024-SCRYING",
    "LP-COMP-2024-TINY-HUT",
  ],
  "crystal-rod": [
    "LP-COMP-ROD",
  ],
  "diamond": [
    "LP-COMP-2024-CHROMATIC-ORB",
    "LP-COMP-2024-GATE",
    "LP-COMP-2024-RAISE-DEAD",
    "LP-COMP-2024-RESURRECTION",
    "LP-COMP-2024-REVIVIFY",
    "LP-COMP-2024-TRUE-RESURRECTION",
    "LP-COMP-CLONE-D",
    "LP-COMP-DIAMOND",
    "LP-COMP-ORB",
  ],
  "diamond-dust": [
    "LP-COMP-2024-GLYPH-OF-WARDING",
    "LP-COMP-2024-GREATER-RESTORATION",
    "LP-COMP-2024-NONDETECTION",
    "LP-COMP-2024-STONESKIN",
    "LP-COMP-2024-SYMBOL",
    "LP-COMP-DUST",
  ],
  "divination": [
    "LP-COMP-2024-AUGURY",
    "LP-COMP-2024-FIND-THE-PATH",
  ],
  "door": [
    "LP-COMP-2024-MAGNIFICENT-MANSION",
  ],
  "dust": [
    "LP-COMP-2024-DISINTEGRATE",
    "LP-COMP-2024-LONGSTRIDER",
    "LP-COMP-2024-SEE-INVISIBILITY",
    "LP-COMP-2024-SEQUESTER",
  ],
  "eggs": [
    "LP-COMP-2024-TELEPATHIC-BOND",
  ],
  "eyelash": [
    "LP-COMP-2024-INVISIBILITY",
  ],
  "fan": [
    "LP-COMP-2024-WIND-WALL",
  ],
  "feather": [
    "LP-COMP-2024-FEAR",
    "LP-COMP-2024-FEATHER-FALL",
    "LP-COMP-2024-FLESH-TO-STONE",
    "LP-COMP-2024-FLY",
    "LP-COMP-2024-FORESIGHT",
    "LP-COMP-PART-WIND-FEATHER",
  ],
  "food": [
    "LP-COMP-2024-ANIMAL-FRIENDSHIP",
    "LP-COMP-2024-ANIMAL-MESSENGER",
  ],
  "fur": [
    "LP-COMP-2024-ARCANE-EYE",
    "LP-COMP-2024-DARKNESS",
    "LP-COMP-2024-ENHANCE-ABILITY",
    "LP-COMP-2024-LIGHTNING-BOLT",
    "LP-COMP-2024-LOCATE-ANIMALS-OR-PLANTS",
    "LP-COMP-2024-LOCATE-CREATURE",
    "LP-COMP-2024-MAJOR-IMAGE",
    "LP-COMP-2024-MINOR-ILLUSION",
    "LP-COMP-2024-PHANTASMAL-FORCE",
    "LP-COMP-2024-SILENT-IMAGE",
    "LP-COMP-FUR",
  ],
  "glass-cone": [
    "LP-COMP-2024-CONE-OF-COLD",
  ],
  "glass-eye": [
    "LP-COMP-2024-CLAIRVOYANCE",
  ],
  "glass-shard": [
    "LP-COMP-2024-SANCTUARY",
    "LP-COMP-2024-WALL-OF-FORCE",
  ],
  "gold-dust": [
    "LP-COMP-2024-ARCANE-LOCK",
  ],
  "grasshopper": [
    "LP-COMP-2024-INSECT-PLAGUE",
    "LP-COMP-2024-JUMP",
  ],
  "gum": [
    "LP-COMP-PART-GUM",
  ],
  "herbs": [
    "LP-COMP-2024-FLAME-BLADE",
    "LP-COMP-2024-GUST-OF-WIND",
    "LP-COMP-2024-HASTE",
    "LP-COMP-2024-LIGHT",
    "LP-COMP-2024-PASSWALL",
  ],
  "holy-symbol": [
    "LP-COMP-2024-BLESS",
  ],
  "holy-water": [
    "LP-COMP-2024-PROTECTION-FROM-EVIL-AND-GOOD",
  ],
  "honey": [
    "LP-COMP-2024-SLOW",
    "LP-COMP-2024-SUGGESTION",
  ],
  "ice": [
    "LP-COMP-2024-ICE-KNIFE",
  ],
  "incense": [
    "LP-COMP-2024-COMMUNE",
    "LP-COMP-2024-CONTROL-WEATHER",
    "LP-COMP-2024-DIVINATION",
    "LP-COMP-2024-FIND-FAMILIAR",
    "LP-COMP-2024-HALLOW",
    "LP-COMP-2024-LEGEND-LORE",
    "LP-COMP-2024-SPEAK-WITH-DEAD",
    "LP-COMP-INCENSE",
  ],
  "ink": [
    "LP-COMP-2024-ILLUSORY-SCRIPT",
    "LP-COMP-2024-TELEPORTATION-CIRCLE",
    "LP-COMP-INK",
  ],
  "iron": [
    "LP-COMP-2024-HEAT-METAL",
    "LP-COMP-2024-HOLD-MONSTER",
    "LP-COMP-2024-HOLD-PERSON",
  ],
  "iron-filings": [
    "LP-COMP-2024-ANTIMAGIC-FIELD",
    "LP-COMP-2024-DISPEL-EVIL-AND-GOOD",
    "LP-COMP-2024-ENLARGE-REDUCE",
    "LP-COMP-2024-REVERSE-GRAVITY",
    "LP-COMP-IRON",
  ],
  "ivory": [
    "LP-COMP-PART-LORE-IVORY",
  ],
  "jacinth": [
    "LP-COMP-2024-ASTRAL-PROJECTION",
  ],
  "jade-circlet": [
    "LP-COMP-2024-SHAPECHANGE",
  ],
  "jade-dust": [
    "LP-COMP-2024-MAGIC-MOUTH",
    "LP-COMP-2024-PROGRAMMED-ILLUSION",
  ],
  "key-ring": [
    "LP-COMP-2024-BEFUDDLEMENT",
  ],
  "kit": [
    "LP-COMP-2024-ANIMATE-DEAD",
    "LP-COMP-2024-ANTIPATHY-SYMPATHY",
    "LP-COMP-2024-ARCANE-HAND",
    "LP-COMP-2024-BANE",
    "LP-COMP-2024-BLACK-TENTACLES",
    "LP-COMP-2024-CIRCLE-OF-DEATH",
    "LP-COMP-2024-CONTROL-WATER",
    "LP-COMP-2024-CREATE-OR-DESTROY-WATER",
    "LP-COMP-2024-CREATION",
    "LP-COMP-2024-DANCING-LIGHTS",
    "LP-COMP-2024-DREAM",
    "LP-COMP-2024-FIRE-SHIELD",
    "LP-COMP-2024-FLAMING-SPHERE",
    "LP-COMP-2024-FLOATING-DISK",
    "LP-COMP-2024-GASEOUS-FORM",
    "LP-COMP-2024-HEX",
    "LP-COMP-2024-HIDEOUS-LAUGHTER",
    "LP-COMP-2024-HYPNOTIC-PATTERN",
    "LP-COMP-2024-ICE-STORM",
    "LP-COMP-2024-LEVITATE",
    "LP-COMP-2024-MASS-SUGGESTION",
    "LP-COMP-2024-STINKING-CLOUD",
    "LP-COMP-2024-SUMMON-DRAGON",
    "LP-COMP-2024-SUNBURST",
    "LP-COMP-2024-TRUE-POLYMORPH",
    "LP-COMP-2024-TRUE-STRIKE",
    "LP-COMP-2024-VITRIOLIC-SPHERE",
  ],
  "lead": [
    "LP-COMP-2024-PRIVATE-SANCTUM",
  ],
  "leather": [
    "LP-COMP-2024-FREEDOM-OF-MOVEMENT",
    "LP-COMP-2024-MAGE-ARMOR",
  ],
  "liquid": [
    "LP-COMP-2024-FALSE-LIFE",
  ],
  "lodestone": [
    "LP-COMP-2024-MENDING",
    "LP-COMP-LOD",
    "LP-COMP-PART-DISINTEGRATE-LOD",
  ],
  "magnifier": [
    "LP-COMP-2024-SUNBEAM",
  ],
  "mica": [
    "LP-COMP-2024-SHATTER",
  ],
  "mini-sword": [
    "LP-COMP-2024-ARCANE-SWORD",
  ],
  "moonseed": [
    "LP-COMP-2024-MOONBEAM",
  ],
  "mushroom": [
    "LP-COMP-2024-HALLUCINATORY-TERRAIN",
    "LP-COMP-2024-TRUE-SEEING",
  ],
  "nuts": [
    "LP-COMP-2024-CONFUSION",
  ],
  "oil": [
    "LP-COMP-2024-REINCARNATE",
  ],
  "onyx": [
    "LP-COMP-2024-CREATE-UNDEAD",
  ],
  "pearl": [
    "LP-COMP-2024-IDENTIFY",
    "LP-COMP-PEARL",
  ],
  "pentacle": [
    "LP-COMP-2024-BANISHMENT",
  ],
  "pins": [
    "LP-COMP-2024-CHAIN-LIGHTNING",
  ],
  "platinum-rings": [
    "LP-COMP-2024-WARDING-BOND",
  ],
  "prayer-wheel": [
    "LP-COMP-2024-REGENERATE",
  ],
  "reed": [
    "LP-COMP-2024-GOODBERRY",
    "LP-COMP-2024-SHILLELAGH",
    "LP-COMP-2024-WATER-BREATHING",
  ],
  "reliquary": [
    "LP-COMP-2024-HOLY-AURA",
    "LP-COMP-2024-MAGIC-JAR",
  ],
  "rhubarb": [
    "LP-COMP-2024-ACID-ARROW",
  ],
  "rope": [
    "LP-COMP-2024-ROPE-TRICK",
  ],
  "rose-petals": [
    "LP-COMP-2024-SLEEP",
  ],
  "rose-sand": [
    "LP-COMP-2024-COLOR-SPRAY",
  ],
  "ruby-dust": [
    "LP-COMP-2024-CONTINUAL-FLAME",
    "LP-COMP-2024-FORBIDDANCE",
    "LP-COMP-2024-FORCECAGE",
    "LP-COMP-2024-SIMULACRUM",
    "LP-COMP-RUBY",
  ],
  "salt": [
    "LP-COMP-2024-MAGIC-CIRCLE",
    "LP-COMP-SALT",
  ],
  "sapphire": [
    "LP-COMP-2024-INSTANT-SUMMONS",
    "LP-COMP-2024-PLANAR-BINDING",
  ],
  "silver-bar": [
    "LP-COMP-2024-GUARDS-AND-WARDS",
    "LP-COMP-PART-ASTRAL-SILVER",
  ],
  "silver-wire": [
    "LP-COMP-WIRE",
  ],
  "soot": [
    "LP-COMP-2024-COMPREHEND-LANGUAGES",
    "LP-COMP-2024-PASS-WITHOUT-TRACE",
    "LP-COMP-SOOT",
  ],
  "spade": [
    "LP-COMP-2024-MOVE-EARTH",
  ],
  "spider": [
    "LP-COMP-2024-WEB",
    "LP-COMP-PART-SPIDER",
  ],
  "statuette": [
    "LP-COMP-2024-CONTINGENCY",
    "LP-COMP-2024-IMPRISONMENT",
    "LP-COMP-2024-PROJECT-IMAGE",
  ],
  "string": [
    "LP-COMP-STRING",
  ],
  "sulfur": [
    "LP-COMP-2024-FLAME-STRIKE",
    "LP-COMP-SULFUR",
  ],
  "thorns": [
    "LP-COMP-2024-SPIKE-GROWTH",
    "LP-COMP-2024-WALL-OF-THORNS",
  ],
  "tiny-chest": [
    "LP-COMP-PART-CHEST-REPLICA",
  ],
  "tuning-fork": [
    "LP-COMP-2024-PLANE-SHIFT",
  ],
  "umbrella": [
    "LP-COMP-2024-SLEET-STORM",
  ],
  "vellum": [
    "LP-COMP-2024-SHIELD-OF-FAITH",
    "LP-COMP-2024-SPIRIT-GUARDIANS",
  ],
  "whistle": [
    "LP-COMP-2024-FAITHFUL-HOUND",
  ],
  "wood": [
    "LP-COMP-2024-LOCATE-OBJECT",
    "LP-COMP-2024-UNSEEN-SERVANT",
    "LP-COMP-WOOD",
  ],
  "yew": [
    "LP-COMP-2024-DETECT-POISON-AND-DISEASE",
  ],
  "ziggurat": [
    "LP-COMP-2024-TONGUES",
  ],
};

const artworkByProductId = new Map(
  Object.entries(productIdsByArtwork).flatMap(([key, productIds]) => {
    const artwork = artworkFiles[`./component-${key}.webp`];
    return productIds.map((productId) => [productId, artwork]);
  })
);

export function componentArtworkFor(productId) {
  return artworkByProductId.get(productId);
}
