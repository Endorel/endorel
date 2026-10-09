import { expect, test } from '@playwright/test';
import { getPagePaths, NOT_FOUND_PATH } from './pages';

const pagePaths = getPagePaths();

test('sitemap includes the main sections', () => {
	expect(pagePaths).toEqual(expect.arrayContaining(['/', '/about/', '/blog/', '/projects/']));
});

for (const path of pagePaths) {
	test(`${path} renders`, async ({ page }) => {
		const response = await page.goto(path);
		expect(response?.status()).toBe(200);
		await expect(page).toHaveTitle(/\S/);
		await expect(page.locator('h1')).toHaveCount(1);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			`https://endorel.se${path}`,
		);
	});
}

const navCases = [
	{ path: '/', active: 'Home' },
	{ path: '/projects/', active: 'Projects' },
	{ path: '/projects/endorel-se/', active: 'Projects' },
	{ path: '/blog/', active: 'Blog' },
	{ path: '/blog/first-post/', active: 'Blog' },
	{ path: '/about/', active: 'About' },
];

for (const { path, active } of navCases) {
	test(`nav marks ${active} as active on ${path}`, async ({ page }) => {
		await page.goto(path);
		const links = page.locator('header nav .internal-links a');
		await expect(links).toHaveText(['Home', 'Projects', 'Blog', 'About']);
		await expect(page.locator('header nav a.active')).toHaveText([active]);
	});
}

test('nav links navigate to their section', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Projects', exact: true }).click();
	await expect(page).toHaveURL(/\/projects\/?$/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects');
});

test('project list links to project pages', async ({ page }) => {
	await page.goto('/projects/');
	await page.getByRole('link', { name: /endorel\.se/ }).click();
	await expect(page).toHaveURL(/\/projects\/endorel-se\/$/);
});

test('project page shows dates, role, tech and links', async ({ page }) => {
	await page.goto('/projects/endorel-se/');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('endorel.se');
	await expect(page.locator('.meta')).toHaveText('2024 – present · Design and development');
	await expect(page.locator('.tech li')).toHaveText([
		'Astro',
		'TypeScript',
		'CSS',
		'GitHub Actions',
	]);
	await expect(page.getByRole('link', { name: 'Visit site' })).toHaveAttribute(
		'href',
		'https://endorel.se',
	);
	await expect(page.getByRole('link', { name: 'Source code' })).toHaveAttribute(
		'href',
		'https://github.com/Endorel/endorel',
	);
});

test('RSS feed lists every blog post', async ({ request }) => {
	const response = await request.get('/rss.xml');
	expect(response.ok()).toBe(true);
	const xml = await response.text();
	const links = [...xml.matchAll(/<item>.*?<link>(.*?)<\/link>/gs)].map(
		([, link]) => new URL(link).pathname,
	);
	const posts = pagePaths.filter((path) => /^\/blog\/.+/.test(path));
	expect(links.sort()).toEqual(posts.sort());
});

test('unknown paths return 404 with the custom page', async ({ page }) => {
	const response = await page.goto(NOT_FOUND_PATH);
	expect(response?.status()).toBe(404);
	await expect(page).toHaveTitle(/^Page not found \|/);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
	await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
	await expect(page.locator('header nav a.active')).toHaveCount(0);

	const suggestions = page.getByRole('navigation', { name: 'Suggested pages' }).getByRole('link');
	await expect(suggestions).toHaveText(['Home', 'Projects', 'Blog']);
	await suggestions.getByText('Projects').click();
	await expect(page).toHaveURL(/\/projects\/$/);
});

test('sitemap excludes the 404 page', () => {
	expect(pagePaths.filter((path) => path.includes('404'))).toEqual([]);
});
