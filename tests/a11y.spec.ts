import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { getPagePaths } from './pages';

for (const path of getPagePaths()) {
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
