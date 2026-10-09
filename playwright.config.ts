import { defineConfig, devices } from '@playwright/test';

// Not 4321, so a running `astro dev` server is never reused by mistake
const port = 4399;

// Tests run against the production build served by `astro preview`,
// so `dist/` must be built first (`npm test` does this).
export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['github'], ['list']] : 'list',
	use: {
		baseURL: `http://localhost:${port}`,
		trace: 'on-first-retry',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		// --ignore-lock keeps the server in the foreground; without it Astro
		// auto-backgrounds `preview` when run by an AI agent and Playwright sees it exit.
		command: `npm run preview -- --port ${port} --ignore-lock`,
		url: `http://localhost:${port}`,
		reuseExistingServer: !process.env.CI,
	},
});
