/**
 * Security helper: validate a same-origin relative path to prevent open redirects.
 *
 * Use when consuming untrusted values like `callbackUrl` to avoid navigating
 * to external origins.
 *
 * @param p - Path string from an untrusted source (e.g., query param).
 * @returns `true` if the path is safe to use in a redirect.
 */
export function isSafeRelativePath(p: string | null): boolean {
	if (!p) return false;
	if (!p.startsWith('/')) return false; // must be relative to same-origin
	if (p.startsWith('//')) return false; // prevent protocol-relative
	if (p.includes('://')) return false; // prevent absolute URLs
	return true;
}
