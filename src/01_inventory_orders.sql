-- LumaPrime: inventory, orders and DM transaction history foundation
-- Run in Supabase SQL Editor. Does not enable checkout yet.
CREATE TABLE IF NOT EXISTS public.marketplace_inventory (
  product_id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('Common','Uncommon','Rare','Very Rare','Legendary','Artifact')),
  price BIGINT NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER CHECK (stock_quantity IS NULL OR stock_quantity >= 0),
  requires_dm_approval BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL CHECK (status IN ('pending_approval','completed','rejected','cancelled')),
  total BIGINT NOT NULL CHECK (total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ
);
CREATE TABLE IF NOT EXISTS public.marketplace_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.marketplace_inventory(product_id),
  product_name TEXT NOT NULL,
  unit_price BIGINT NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);
ALTER TABLE public.marketplace_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_order_items ENABLE ROW LEVEL SECURITY;
-- Public inventory may be read, but cannot be edited from a player browser.
DROP POLICY IF EXISTS "Anyone can view marketplace inventory" ON public.marketplace_inventory;
CREATE POLICY "Anyone can view marketplace inventory" ON public.marketplace_inventory FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Players view own orders" ON public.marketplace_orders;
CREATE POLICY "Players view own orders" ON public.marketplace_orders FOR SELECT TO authenticated USING (player_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "Players view own order items" ON public.marketplace_order_items;
CREATE POLICY "Players view own order items" ON public.marketplace_order_items FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.marketplace_orders o WHERE o.id = order_id AND o.player_id = (SELECT auth.uid()))
);
-- DM can audit transaction history, but this does not expose it to other players.
CREATE OR REPLACE FUNCTION public.dm_list_transactions()
RETURNS TABLE (transaction_id UUID, player_id UUID, player_name TEXT, amount BIGINT, transaction_type TEXT, description TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.dm_admins a WHERE a.user_id = (SELECT auth.uid())
  ) THEN
    RAISE EXCEPTION 'DM administrator access required.';
  END IF;
  RETURN QUERY
  SELECT t.id, t.player_id, p.display_name, t.amount, t.transaction_type, t.description, t.created_at
  FROM public.lumina_transactions t
  JOIN public.player_profiles p ON p.id = t.player_id
  ORDER BY t.created_at DESC LIMIT 200;
END;
$$;
REVOKE ALL ON FUNCTION public.dm_list_transactions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dm_list_transactions() TO authenticated;

-- Seed product identifiers and authoritative prices from the storefront catalog.
-- Stock is NULL for unlimited common/uncommon; 0 for higher rarity until DM sets inventory.
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-COIN-0001','Coin of Draconic Luck™','Uncommon',850,NULL,FALSE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-BRACELET-0002','Bracelets of Faithful Friendship','Rare',2500,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-PEEPHOLE-0003','Portable Peephole™','Common',420,NULL,FALSE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-PUPPY-0004','Bag of Puppies','Very Rare',4500,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-INVIS-0005','Invisibility Timer™','Very Rare',3800,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-BUBBLE-0006','Bubble Blade™','Rare',1850,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-SECRETS-0007','The Secret Book of Secrets','Legendary',5900,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-CRAB-0008','Crustacean Clapper','Rare',3400,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-INK-0009','Poison Ink Beads','Rare',420,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-GRAVE-0010','Anchor-Ring // Model: “Gravemark”','Uncommon',2800,NULL,FALSE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-CANE-0011','Incognito Cane','Uncommon',3750,NULL,FALSE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-COMB-0012','Hydriana’s Comb','Rare',7600,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-DECK-0014','The Loaded Deck','Rare',18500,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-HORN-0015','Warhorn of the Valkyrie','Rare',22000,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-CANDLE-0016','Sage’s Rest Candle','Uncommon',320,NULL,FALSE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-OIL-0017','Ultraviolet Oil (Flask)','Uncommon',150,NULL,FALSE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-SPYGLASS-0018','Spyglass of the Seaspecter','Rare',16500,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-CAULDRON-0019','Mealwish Cauldron™','Rare',10000,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-COMPASS-0020','Monster Compass™','Rare',16250,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval) VALUES ('LP-ZOMBIE-0021','Draft of Zombification™','Rare',3700,0,TRUE) ON CONFLICT (product_id) DO NOTHING;
-- Special curated bundle: treated as restricted Artifact stock.
INSERT INTO public.marketplace_inventory(product_id,product_name,rarity,price,stock_quantity,requires_dm_approval)
VALUES ('LP-RINGS-0013','The Trinity of Resonance','Artifact',12500,1,TRUE)
ON CONFLICT (product_id) DO NOTHING;
