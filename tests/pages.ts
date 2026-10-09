import { readFileSync } from 'node:fs';

/**
 * Paths of every page in the built site, read from the generated sitemap so
 * that new posts and projects are covered automatically.
 */
export function getPagePaths(): string[] {
	let xml: string;
	try {
		xml = readFileSync(new URL('../dist/sitemap-0.xml', import.meta.url), 'utf8');
	} catch {
		throw new Error('dist/sitemap-0.xml not found. Build the site first: npm run build');
	}
	return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname);
}

/** A path that doesn't exist, so the server responds with the custom 404 page. */
export const NOT_FOUND_PATH = '/this-page-does-not-exist/';
