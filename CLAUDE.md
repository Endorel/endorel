# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio/blog site for Hélène Francke (senior full-stack developer), built on Astro 7, starting from the Astro "blog" starter template (based on Bear Blog). Static site output; MDX and sitemap integrations are enabled in `astro.config.mjs`.

## Commands

Requires Node 22.12+. TypeScript is pinned to 6.x because `@astrojs/check` does not yet support TypeScript 7.

- `npm run dev` — dev server at `localhost:4321`
- `npm run build` — runs `astro check` (TypeScript/Astro type checking) **then** `astro build` to `./dist/`; type errors fail the build
- `npm run preview` — serve the production build locally
- `npx astro check` — type-check only
- `npm run lint` — ESLint (flat config in `eslint.config.js`: JS + typescript-eslint + eslint-plugin-astro recommended, with `eslint-config-prettier` last)
- `npm run format` / `npm run format:check` — Prettier with `prettier-plugin-astro` (tabs, single quotes, width 100; `package.json` uses spaces). `src/content/` is excluded so blog prose isn't reformatted.
- `npm test` — builds the site, then runs the Playwright tests in `tests/` against `astro preview` (Chromium only; first run needs `npx playwright install chromium`)
- `npx playwright test tests/smoke.spec.ts -g "nav marks"` — run one file or matching tests (needs an existing `dist/`)

The tests read `dist/sitemap-0.xml` to discover every page, so new posts and projects are covered automatically. They check: each page renders with one `<h1>` and the right canonical URL; nav active state; project page content; RSS lists every post; unknown paths return 404 with the custom page (`smoke.spec.ts`); internal links and images resolve (`links.spec.ts`); and no axe WCAG 2.2 AA violations (`a11y.spec.ts`). The 404 page (`src/pages/404.astro`) is excluded from the sitemap, so the a11y and link tests add it explicitly via `NOT_FOUND_PATH` in `tests/pages.ts`. Pages that shouldn't be indexed pass `noindex` to `BaseHead`, which emits `<meta name="robots" content="noindex">` instead of a canonical URL. Blog post bodies must not contain a `# H1` because the layout already renders the title as `<h1>`.

### Astro dev/preview servers start in the background when run by an agent

When Astro 7 detects it is being run by an AI agent (via the `am-i-vibing` package, e.g. inside Claude Code), `astro dev` and `astro preview` (and so `npm run dev` / `npm run preview`) do **not** stay in the foreground. They spawn a detached background server, print a one-line JSON message with its URL and pid, and exit with code 0. Logs are JSON too. People running the same commands in a normal terminal are unaffected.

- Manage a background server with `npx astro dev status|logs|stop` (or `npx astro preview status|logs|stop`). Stop it when done; otherwise it keeps holding port 4321.
- `--ignore-lock` (e.g. `npm run preview -- --ignore-lock`) forces a one-off foreground server instead. Astro's `status`, `logs` and `stop` don't track it, so stop it like any other process.
- Anything that supervises the server process needs the foreground form. That's why the Playwright `webServer` command in `playwright.config.ts` passes `--ignore-lock`: without it, Playwright sees the command exit and fails with "Process from config.webServer exited early", leaving an orphaned background preview server behind. The tests use port 4399, not 4321, because Playwright reuses an existing server on its port outside CI, and would otherwise test a running `astro dev` server instead of the build.

CI (`.github/workflows/ci.yml`) runs `npm ci`, `lint`, `format:check`, `build` and the Playwright tests on Node 24 for every PR and push to `main`, so run those before pushing.

Dependabot (`.github/dependabot.yml`) opens weekly update PRs for npm and GitHub Actions, labelled `infra`. npm updates are grouped as `astro` (`astro`, `@astrojs/*`), `lint-and-format` and `testing`; `typescript` is deliberately left ungrouped because it is pinned to 6.x (issue #10).

## Architecture

- **Content collections**: blog posts live in `src/content/blog/` (`.md`/`.mdx`) and are loaded by a `glob()` loader defined in `src/content.config.ts` (Content Layer API — not the legacy `src/content/config.ts`). Frontmatter is validated by the zod schema there (`title`, `description`, `pubDate` required; `updatedDate`, `heroImage` optional); import `z` from `astro/zod` (Zod 4). Adding a frontmatter field requires updating that schema and the `BlogPost` layout props. Entries are identified by `post.id` (there is no `slug`), and rendered with `render(post)` from `astro:content`.
- **Projects collection**: portfolio projects live in `src/content/projects/`, with a schema in the same `content.config.ts` (`title`, `description`, `startDate` required; `endDate` (omit for ongoing), `role`, `tech[]`, `repoUrl`, `liveUrl`, `heroImage`, `featured` optional). `/projects` lists featured projects first, then by `startDate` descending; `/projects/[...slug].astro` renders each with `src/layouts/Project.astro`. `ProjectDates` and `TechList` in `src/components/Project/` are shared by the list and detail pages.
- **Routing**: file-based in `src/pages/`. `blog/[...slug].astro` generates one static page per post via `getStaticPaths()` and renders it inside `src/layouts/BlogPost.astro`. `blog/index.astro` lists posts sorted by `pubDate`; `rss.xml.js` builds the feed from the same collection.
- **Shared head/meta**: every page includes `BaseHead.astro`, which imports `src/styles/global.css` (so global styles are loaded through it, not per page) and emits the canonical URL, title and description (no OpenGraph/Twitter tags). Canonical URLs, RSS links and the sitemap use `site` from `astro.config.mjs` (`https://endorel.se`).
- **Site constants**: `SITE_TITLE` / `SITE_DESCRIPTION` in `src/consts.ts` are used by the header, index pages, and RSS.
- **Styling**: plain CSS only (no Sass) — component styles go in scoped `<style>` blocks in the `.astro` file. Parent scoped styles reach a child component's root element only if the child spreads its props onto it (as `HeaderLink.astro` does with `{...props}`), which is how `Header`'s `nav a.active` rule styles the links. Design tokens (colors, shadows) are CSS custom properties in `global.css`; some are raw RGB triplets meant to be used as `rgb(var(--gray))` / `rgba(var(--black), 5%)`.
- Static assets (images, fonts, favicon) are in `public/` and referenced by absolute path (e.g. `/blog-placeholder-1.jpg`).
