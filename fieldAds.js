// Each entry is an in-world advertisement. Buttons reveal the sponsor's details.
export const fieldAds = [
  {
    id: "obsidian", name: "Obsidian Silent Delivery", type: "courier", headline: "Your parcel was never here.",
    copy: "Discreet delivery for cargo that prefers a quiet entrance.", action: "View service",
    details: "Ask your DM whether Obsidian Silent Delivery serves your current port. Deliveries can be arranged with the courier in-game."
  },
  {
    id: "spiral", name: "Spiral Gate Transit", type: "transit", headline: "One jump. Nine realms.",
    copy: "Need a gate route? Try the departure board.", action: "Check departures",
    details: "Departure times vary by realm, gate conditions, and how long customs spends inspecting your luggage. Ask at the next Spiral Gate terminal for current routes."
  },
  {
    id: "scrap", name: "Scrap Exchange Network", type: "salvage", headline: "Turn your junk into Lumina.",
    copy: "That questionable crate might be worth something.", action: "Get a quote",
    details: "Bring salvage to a Scrap Exchange broker in-game. Appraisals depend on condition, origin, and whether the crate is making that noise on purpose."
  },
  {
    id: "rootwatch-tea", name: "Rootwatch Tea House", type: "leisure", headline: "Steep for seven heartbeats.",
    copy: "Warm your hands with a cup brewed beneath Sion's canopy.", action: "Read the menu",
    details: "Today's pot is silverleaf and roasted pear. Check the chalkboard for a refill, a pastry, or a booth away from the talking roots."
  },
  {
    id: "pearl-customs", name: "Pearl Customs Help Desk", type: "paperwork", headline: "Declare it before it declares itself.",
    copy: "A friendly reminder for anyone traveling with a sentient heirloom.", action: "View checklist",
    details: "Have your Arrival Visa and cargo manifest ready at the port. Give your heirloom a chance to practice answering to its listed name."
  },
  {
    id: "rented-moon", name: "Rent-a-Moon Holographics", type: "arcana", headline: "Finally, a full moon on your schedule.",
    copy: "Set the mood in any cabin with a moon that fits in a carry case.", action: "View moon phases",
    details: "Choose a crescent, a harvest moon, or a full moon. For indoor use. Check with your crew before enabling the howling soundtrack."
  },
  {
    id: "rusted-halo", name: "The Rusted Halo", type: "salvage", headline: "Three bins marked ‘probably fine.’",
    copy: "Browse reclaimed hardware on the lower decks of Helion Spire.", action: "Find the stall",
    details: "Follow the welding sparks to the Scrap Exchange bazaar. Bring measurements if you're shopping for a specific replacement part."
  },
  {
    id: "good-night", name: "Good Night, Void", type: "leisure", headline: "Fall asleep before the void notices.",
    copy: "A bedtime audio feed of rain, vent hum, and distant engines.", action: "Browse recordings",
    details: "The sampler includes Rain on Pearl, Sion at Dusk, and Engine Room With the Rattle Fixed. The last track was recorded on an unusually good day."
  },
  {
    id: "pocket-port", name: "Pocket Port Lockers", type: "courier", headline: "Your luggage can wait here.",
    copy: "Daily lockers for coats, crates, and awkwardly long souvenirs.", action: "View locker sizes",
    details: "Choose Cabin Bag, Cargo Crate, or Unreasonably Long Staff. Keep your claim stub somewhere outside the locker."
  },
  {
    id: "sao-sunrise", name: "Sao Sunrise Roasters", type: "leisure", headline: "For crews on their second dawn.",
    copy: "Hot coffee for arrivals, departures, and the watch in between.", action: "See the roast list",
    details: "Try a cup of Dockside Dark at a participating port kiosk. The extra shot is called the Third Dawn."
  },
  {
    id: "lost-found", name: "Gate Lost & Found", type: "paperwork", headline: "Yes, we found your other glove.",
    copy: "Claim stray belongings recovered around Spiral Gate terminals.", action: "Check recovered items",
    details: "Bring a description and your travel date. If your glove has started a new life with another glove, both are still eligible for pickup."
  },
  {
    id: "bay-forty-seven", name: "Bay 47", type: "salvage", headline: "The part your ship was missing.",
    copy: "Ask about secondhand fittings in the Forge Prime scrapyards.", action: "Check stock",
    details: "Take your part number to the Bay 47 broker. The exo-suits at the entrance can point you to the right counter."
  },
  {
    id: "window-seat", name: "Window Seat Weekly", type: "transit", headline: "A better view costs one aisle seat.",
    copy: "Passenger-written reviews of the Nine Realms' scenic routes.", action: "Read the route review",
    details: "This week's issue covers the approach to Pearl, where to sit for a good view, and which windows are currently fogged over."
  },
  {
    id: "echo-pet", name: "Second Self Pet Sitting", type: "leisure", headline: "We watch both of them.",
    copy: "Boarding for pets whose reflections make separate plans.", action: "See boarding options",
    details: "Bring the usual food and tell the sitter which animal answers to which name. Boarding includes playtime for the pair."
  },
  {
    id: "needle-nova", name: "Needle & Nova Alterations", type: "leisure", headline: "Look put together at first contact.",
    copy: "Repairs and alterations for travel coats, cloaks, and ceremonial hems.", action: "Check turnaround",
    details: "Drop off garments at a port counter with a pickup date. List any concealed pockets you expect to find again."
  },
  {
    id: "hollow-market", name: "The Hollow Market", type: "salvage", headline: "Try our weightless showroom.",
    copy: "Browse Scrap Exchange stalls inside an asteroid near Cindar-3.", action: "Find the market",
    details: "Follow the market's docking instructions and clip your shopping bag to a rail. Loose purchases tend to drift into neighboring stalls."
  },
  {
    id: "arrival-ink", name: "Arrival Ink Forms & Copies", type: "paperwork", headline: "We photocopy holograms. Carefully.",
    copy: "Travel packets, spare manifests, and waterproof document sleeves.", action: "See document services",
    details: "Ask for a passenger packet at the counter. Official visa approvals come from the port authority."
  },
  {
    id: "lantern-line", name: "Lantern Line Couriers", type: "courier", headline: "A little light from home.",
    copy: "Send letters and care parcels to a ship's next scheduled stop.", action: "Check parcel routes",
    details: "Give the clerk the ship name and expected port. If plans change, ask about holding the parcel for collection."
  },
  {
    id: "gravity-gym", name: "Gravity Optional Fitness", type: "leisure", headline: "Leg day, now with less gravity.",
    copy: "Short exercise classes for crews between dock assignments.", action: "View class schedule",
    details: "Beginner sessions use the tethered studio. Ask about the standing balance class before booking Free-Float Pilates."
  },
  {
    id: "mirror-weather", name: "The Mirror Weather Feed", type: "arcana", headline: "A chance of yourself by evening.",
    copy: "An unofficial forecast for reflective conditions around the gates.", action: "Read the forecast",
    details: "Today's travel note suggests keeping a cloth over mirrors when docking. Conditions are compiled from passenger reports."
  },
  {
    id: "patch-and-pulse", name: "Patch & Pulse Dock Repair", type: "salvage", headline: "That rattle has a name.",
    copy: "Find out what's knocking before your next gate jump.", action: "View repair services",
    details: "Bring a recording and your dock number to the service desk. The diagnostic fee includes one sympathetic nod."
  },
  {
    id: "nebula-noodles", name: "Nebula Noodles", type: "leisure", headline: "Lunch in a bowl with a lid.",
    copy: "Noodle cups for crews whose lunch breaks rarely happen sitting down.", action: "Read today's menu",
    details: "Ask for mushroom broth or smoked pepper broth. The tethered spoon is available on request."
  },
  {
    id: "echo-voicemail", name: "EchoMail Message Service", type: "courier", headline: "Leave a message after the second chime.",
    copy: "Record a voice note for a traveler whose ship is between gates.", action: "See delivery options",
    details: "Choose delivery to a port terminal or pickup by claim phrase. Say your own name first to make the recording easier to identify."
  },
  {
    id: "helm-school", name: "The Spare Helm Academy", type: "transit", headline: "Practice docking on our ship.",
    copy: "Flight simulator lessons for anyone newly responsible for a helm.", action: "Browse lessons",
    details: "The first session covers dock approach, hand signals, and how to restart a simulated maneuver after a bad angle."
  },
  {
    id: "moon-mite", name: "Moon Mite Pest Service", type: "salvage", headline: "Small footprints in the sugar?",
    copy: "Cabin inspections for mites, pantry pests, and stowaway spores.", action: "View inspection options",
    details: "Bring a sketch or sample container to the dock office. Keep the suspect pantry shelf closed until your appointment."
  },
  {
    id: "sion-press", name: "Canopy Press of Sion", type: "leisure", headline: "A guide that folds smaller than a leaf.",
    copy: "Pocket editions of trail maps, field journals, and port poetry.", action: "Browse the press",
    details: "The current trail-map edition has room for detour notes. Ask a local guide about conditions before taking a marked route."
  },
  {
    id: "candle-keeper", name: "The Wickkeeper's Counter", type: "arcana", headline: "Give the cabin a softer glow.",
    copy: "Flameless cabin lights with settings from campfire to first dawn.", action: "See the light settings",
    details: "Pick the lantern mode if you're reading charts. The campfire model comes with a volume dial for its crackle."
  },
  {
    id: "right-realm", name: "Right Realm Travel Desk", type: "transit", headline: "Double-check the gate number.",
    copy: "Get help comparing layovers, baggage allowances, and return routes.", action: "View travel services",
    details: "Bring a preferred destination and departure date. Same-day gate schedules can change, so confirm with the terminal before boarding."
  },
  {
    id: "baggage-tales", name: "Baggage Tales Engraving", type: "courier", headline: "Put a name on your cargo.",
    copy: "Engraved tags and ship emblems for bags that all look alike.", action: "See tag options",
    details: "Pick a metal tag or a soft loop. Ask for two lines if you'd like both a name and a port of return."
  },
  {
    id: "astral-auctions", name: "Astral Attic Auctions", type: "salvage", headline: "Someone else's attic has better loot.",
    copy: "An in-world auction board for estate curios and odd furniture.", action: "View the auction board",
    details: "This week's catalog includes a folding lectern, an empty music box, and a rug with surprisingly strong opinions about placement."
  },
  {
    id: "pearl-portrait", name: "Pearl Portrait Parlour", type: "leisure", headline: "Your best side in every realm.",
    copy: "Book a crew portrait on your next stop at Pearl.", action: "View portrait styles",
    details: "The studio offers painted portraits and small travel prints. Tell the artist in advance if anyone insists on posing in shadow."
  },
  {
    id: "safety-whistle", name: "Three Chimes Safety Supply", type: "salvage", headline: "Find the emergency kit in the dark.",
    copy: "Luminous labels, cabin tethers, and replacement whistles.", action: "See cabin supplies",
    details: "Bring the size of your kit and the type of surface it mounts to. The clerk has samples you can test for visibility."
  },
  {
    id: "transit-timer", name: "Interrealm Time Desk", type: "paperwork", headline: "Meet tomorrow. Their tomorrow.",
    copy: "A time conversion board for crews planning across different ports.", action: "See the schedule planner",
    details: "Write both port names on the schedule slip and ask for a local copy for each party. The desk clock is set to the current terminal."
  },
  {
    id: "zebra-zepra", name: "Zepra Midnight Bites", type: "leisure", headline: "Dinner after the closing bell.",
    copy: "Late-night food stalls for travelers on the eastern gate route.", action: "See who's open",
    details: "Look for the lantern board near the gate on arrival. The chalk marks show which stalls are serving another round."
  },
  {
    id: "polite-haunting", name: "The Polite Haunting Bureau", type: "arcana", headline: "Please stop knocking at three.",
    copy: "Request a mediator for the echo that won't observe quiet hours.", action: "Read service terms",
    details: "The first meeting establishes a preferred knocking hour and a room where everyone agrees to be heard. Bring any previous cabin rules."
  },
  {
    id: "clear-deck", name: "Clear Deck Cleaning Co.", type: "leisure", headline: "The glitter is somebody else's problem.",
    copy: "Crew cabin cleanup after celebrations and other sparkling incidents.", action: "View cleaning packages",
    details: "The ordinary package covers a cabin sweep and surface cleaning. Call out glitter that floats or sings so the crew can bring a sealed bin."
  },
  {
    id: "witness-stamp", name: "Witness & Stamp", type: "paperwork", headline: "Sign here. In this dimension.",
    copy: "Book a witness for routine manifests and shipboard agreements.", action: "Check office hours",
    details: "Bring the complete document and valid identification. All signatories should attend the appointment together."
  },
  {
    id: "quiet-quay", name: "Quiet Quay Berths", type: "transit", headline: "A dock on the quiet side.",
    copy: "Ask about overnight mooring away from the departure chimes.", action: "View berth options",
    details: "Tell the quay office your ship's length and service needs. Quiet berths sit farther from the main terminal walkways."
  },
  {
    id: "planet-postcards", name: "Postcards from Almost Everywhere", type: "courier", headline: "Wish you were here. We think.",
    copy: "Printed postcards of ports, gates, and one accidentally scenic alley.", action: "Browse the rack",
    details: "Every card comes with room for a destination and a return port. Ask about the mystery image pack if you like a surprise."
  },
  {
    id: "sion-seed", name: "Sion Seed Library", type: "leisure", headline: "Grow a little piece of the canopy.",
    copy: "Ask about cabin-friendly plants and seed exchanges on Sion.", action: "Browse available seeds",
    details: "The desk can help you choose a pot for your cabin's light. Check the destination port's rules before carrying live plants through a gate."
  },
  {
    id: "brass-translation", name: "Brass Tongue Translation", type: "paperwork", headline: "Your phrasebook deserves a second opinion.",
    copy: "Local translation help for port notices, menus, and polite introductions.", action: "View language services",
    details: "Bring the text or a copy to the desk. Tell the translator whether you need the formal version or the way people actually order lunch."
  },
  {
    id: "starboard-stage", name: "The Starboard Stage", type: "leisure", headline: "Your captain gets one joke.",
    copy: "An open-mic circuit for crews killing time between departures.", action: "See tonight's lineup",
    details: "Sign up at the venue door. Acts get a short set, and audience requests go to the host."
  },
  {
    id: "fresh-vault", name: "The Fresh Vault", type: "courier", headline: "From market stall to cold hold.",
    copy: "Short-term cold storage for groceries and perishable cargo.", action: "View storage options",
    details: "Ask the depot for a chilled or frozen compartment. Label everything with a pickup date before handing it over."
  },
  {
    id: "spare-parts-radio", name: "Spare Parts Radio", type: "salvage", headline: "A show for people who keep every screw.",
    copy: "A repair call-in feed from the Nine Realms' dockside workbenches.", action: "See the broadcast schedule",
    details: "This week's segment covers how to describe a mystery part well enough for someone else to find it. Keep a ruler handy."
  },
  {
    id: "small-maps", name: "A Very Small Map Shop", type: "transit", headline: "Fold it until it fits your pocket.",
    copy: "Print maps of terminals, streets, and passenger walks.", action: "Browse maps",
    details: "Ask for the current terminal edition at the counter. The foldout marks the exits, passenger services, and places to sit."
  },
  {
    id: "prime-sea-windows", name: "Prime Sea Window Service", type: "salvage", headline: "See the view through the view window.",
    copy: "Viewport cleaning and scratch assessments while your ship is docked.", action: "View window services",
    details: "Give the service crew your berth and tell them which windows have fogging between the panes. They can assess those before quoting work."
  },
  {
    id: "pocket-museum", name: "The Pocket Museum", type: "leisure", headline: "Nine realms in one layover.",
    copy: "A traveling exhibit of everyday objects and their strange histories.", action: "See what's on display",
    details: "The current exhibit includes coins, tools, toys, and a lunch tin with a remarkably detailed travel log."
  },
  {
    id: "brim-and-buckle", name: "Brim & Buckle Outfitters", type: "leisure", headline: "Keep your hat through the jump.",
    copy: "Travel hats, fitted straps, and spare buckles for departure day.", action: "Browse outfitting",
    details: "Bring your hat or bag for a fitting. Most straps come in three lengths and can be adjusted at the counter."
  },
  {
    id: "gate-flowers", name: "Last Gate Florals", type: "courier", headline: "Send flowers across the realms.",
    copy: "Bouquets arranged for pickup at participating destination ports.", action: "See bouquet options",
    details: "Order by the recipient's pickup port and choose a local seasonal bouquet. Gift notes are sealed at the sending counter."
  },
  {
    id: "dock-quiz", name: "The Docklight Quiz League", type: "leisure", headline: "Settle it at trivia night.",
    copy: "Portside quiz nights for crews with opinions about everything.", action: "Find the next quiz",
    details: "Register at the venue when you arrive. This week's categories include gate geography, ship names, and the price of a good bowl of noodles."
  }
];

export const fieldAdInterval = 30 * 60 * 1000;
const adsPerSlot = 3;

export function getFieldAds(slot) {
  const start = (slot * adsPerSlot) % fieldAds.length;
  return Array.from({ length: adsPerSlot }, (_, index) => fieldAds[(start + index) % fieldAds.length]);
}
