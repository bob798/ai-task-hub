/**
 * Sanitize user name: strip HTML tags, trim, limit to maxLength.
 * Returns null if result is empty.
 */
export function sanitizeName(name: string, maxLength: number = 50): string | null {
  return name.replace(/<[^>]*>/g, "").trim().slice(0, maxLength) || null;
}
