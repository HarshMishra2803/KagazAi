/**
 * KagazAi Presence & Cursor Utilities
 * Provides deterministic user colors and initials extraction.
 */

// Curated accessible color palette adhering to WCAG AA contrast (no purple)
export const USER_COLORS = [
  '#2563eb', // Blue
  '#059669', // Emerald
  '#b45309', // Amber (darkened for contrast)
  '#dc2626', // Red
  '#0891b2', // Cyan
  '#ea580c', // Orange
  '#0f766e', // Teal
  '#475569', // Slate
];

/**
 * Computes a deterministic color from an identifier (e.g. user ID or email).
 * Ensures the same user always appears with the same color across sessions.
 */
export function getDeterministicColor(identifier: string): string {
  if (!identifier) return USER_COLORS[0];

  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = (hash << 5) - hash + identifier.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }

  const index = Math.abs(hash) % USER_COLORS.length;
  return USER_COLORS[index];
}

/**
 * Extracts 1-2 uppercase letters from a name for compact presence avatars.
 * e.g. "Harsh Sharma" -> "HS", "Alice" -> "AL"
 */
export function getInitials(name: string): string {
  if (!name || name.trim().length === 0) return '?';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
