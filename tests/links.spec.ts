import { expect, test } from '@playwright/test';
import { getPagePaths } from './pages';

for (const path of getPagePaths()) {
	test(`internal links and images on ${path} resolve`, async ({ page, request }) => {
		await page.goto(path);
		const urls = await page
			.locator('a[href], img[src], link[href]')
			.evaluateAll((elements) =>
				elements.map((el) => (el as HTMLAnchorElement).href || (el as HTMLImageElement).src),
			);
		const internal = [
			...new Set(urls.filter((url) => new URL(url).origin === new URL(page.url()).origin)),
		];

		for (const url of internal) {
			const response = await request.get(url);
			expect(response.status(), `${url} (linked from ${path})`).toBe(200);
		}
	});
}
