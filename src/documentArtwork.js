const artwork = import.meta.glob("./catalog-*.webp", {
  eager: true,
  import: "default",
  query: "?url"
});

export function documentArtworkFor(productId) {
  return artwork[`./catalog-${productId.toLowerCase()}.webp`];
}

export function alternateDocumentArtworkFor(productId) {
  if (productId !== "LP-COIN-0001") return [];
  return [
    { label: "View the coin set", url: artwork["./catalog-lp-coin-0001-mint.webp"] },
    { label: "View the alternate coin face", url: artwork["./catalog-lp-coin-0001-detail.webp"] }
  ];
}
