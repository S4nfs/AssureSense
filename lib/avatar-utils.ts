// Utility functions for generating profile pictures using DiceBear API

export type AvatarStyle =
  | "avataaars"
  | "bottts"
  | "identicon"
  | "initials"
  | "lorelei"
  | "micah"
  | "personas"
  | "pixel-art"

/**
 * Generate a DiceBear avatar URL directly (client-side)
 * This is faster than going through the Python backend
 */
export function generateAvatarUrl(seed: string, style: AvatarStyle = "avataaars"): string {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`
}

/**
 * Generate avatar URL for a patient using their ID or name
 */
export function getPatientAvatar(patientId: string, patientName?: string): string {
  const seed = patientName || patientId
  return generateAvatarUrl(seed, "avataaars")
}

/**
 * Generate avatar URL for a user using their ID or email
 */
export function getUserAvatar(userId: string, userEmail?: string): string {
  const seed = userEmail || userId
  return generateAvatarUrl(seed, "micah")
}

/**
 * Get initials from a name for fallback display
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
