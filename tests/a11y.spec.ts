import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { getPagePaths, NOT_FOUND_PATH } from './pages';

// The 404 page isn't in the sitemap, so add it explicitly
for (const path of [...getPagePaths(), NOT_FOUND_PATH]) {
	test(`${path} has no detectable WCAG 2.2 AA violations`, async ({ page }) => {
		await page.goto(path);
		const { violations } = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
			.analyze();

		const summary = violations.map(
			({ id, help, nodes }) =>
				`${id}: ${help} (${nodes.map((n) => n.target.join(' ')).join(', ')})`,
		);
		expect(summary).toEqual([]);
	});
}
