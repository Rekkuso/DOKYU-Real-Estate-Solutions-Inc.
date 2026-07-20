/**
 * Default gradient fallback for listings without images.
 * Used across client components when a listing has no uploaded photos.
 */

const DEFAULT_GRADIENTS = [
  "from-blue-600 to-indigo-600",
  "from-emerald-600 to-teal-600",
  "from-orange-500 to-rose-500",
  "from-purple-600 to-pink-600",
  "from-cyan-600 to-blue-600",
];

export function getDefaultGradient(id: number): string {
  return DEFAULT_GRADIENTS[id % DEFAULT_GRADIENTS.length];
}
