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

/**
 * Security helper: determine if a URL is internal to the current origin.
 *
 * Accepts absolute (e.g., "https://app.example.com/path") or relative ("/path")
 * input. Rejects protocol-relative ("//host") and cross-origin URLs.
 *
 * Use when consuming untrusted values like `callbackUrl` that may be absolute.
 *
 * @param url - Absolute or relative URL from an untrusted source.
 * @returns `true` if the URL resolves to the current origin; otherwise `false`.
 */
export function isInternal(url: string): boolean {
	try {
		if (url.startsWith('/')) return !url.startsWith('//');
		const u = new URL(url, window.location.origin);
		return u.origin === window.location.origin;
	} catch {
		return false;
	}
}
