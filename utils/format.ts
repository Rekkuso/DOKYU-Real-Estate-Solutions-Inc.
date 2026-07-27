/**
 * Format a price in compact display (e.g. ₱25.5M, ₱25K, ₱999).
 * Used in property cards, listing previews, and dashboards.
 */
export function formatPrice(price: number): string {
  if (price >= 1000000) return `₱${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `₱${(price / 1000).toFixed(0)}K`;
  return `₱${price.toLocaleString()}`;
}

/**
 * Format a price in full display (e.g. ₱25,500,000).
 * Uses Intl.NumberFormat for locale-aware formatting.
 * Used on property detail pages and other contexts where precision matters.
 */
export function formatFullPrice(price: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
