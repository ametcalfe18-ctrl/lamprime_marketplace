export function offerLabel(offer, partnerName) {
  if (offer?.kind === "percent") return `${offer.percent}% off`;
  if (offer?.kind === "bogo") return offer.percent === 100 ? "Buy one, get one free" : `Buy one, get the second ${offer.percent}% off`;
  if (offer?.kind === "bundle" && partnerName) return `Bundle with ${partnerName} · ${offer.percent}% off the partner item`;
  return null;
}

export function priceCartLines(lines) {
  const byProduct = new Map(lines.map((line) => [line.item.id, line]));
  const bestSavings = new Map();

  function consider(line, discountedQuantity, percent, label) {
    const savings = Math.floor(line.unitPrice * percent / 100) * discountedQuantity;
    if (savings > (bestSavings.get(line.item.id)?.savings || 0)) {
      bestSavings.set(line.item.id, { savings, label });
    }
  }

  for (const line of lines) {
    const offer = line.product?.listing_details?.offer;
    if (!line.product?.is_active || !offer) continue;
    if (offer.kind === "percent") consider(line, line.quantity, offer.percent, offerLabel(offer));
    if (offer.kind === "bogo") consider(line, Math.floor(line.quantity / 2), offer.percent, offerLabel(offer));
    if (offer.kind === "bundle") {
      const partner = byProduct.get(offer.partner_id);
      if (partner?.product?.is_active && line.product.requires_dm_approval === partner.product.requires_dm_approval) {
        consider(partner, Math.min(line.quantity, partner.quantity), offer.percent, offerLabel(offer, partner.product.product_name));
      }
    }
  }

  return lines.map((line) => {
    const discount = bestSavings.get(line.item.id);
    return { ...line, lineTotal: line.unitPrice * line.quantity - (discount?.savings || 0), discount };
  });
}
