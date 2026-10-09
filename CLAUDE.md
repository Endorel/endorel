# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio/blog site for Helene Francke, built on Astro 7, starting from the Astro "blog" starter template (based on Bear Blog). Static site output; MDX and sitemap integrations are enabled in `astro.config.mjs`.

## Commands

Requires Node 22.12+. TypeScript is pinned to 6.x because `@astrojs/check` does not yet support TypeScript 7.

- `npm run dev` — dev server at `localhost:4321`
- `npm run build` — runs `astro check` (TypeScript/Astro type checking) **then** `astro build` to `./dist/`; type errors fail the build
- `npm run preview` — serve the production build locally
- `npx astro check` — type-check only (this is the only lint/verification step; there is no test suite or linter configured)

## Architecture

- **Content collections**: blog posts live in `src/content/blog/` (`.md`/`.mdx`) and are loaded by a `glob()` loader defined in `src/content.config.ts` (Content Layer API — not the legacy `src/content/config.ts`). Frontmatter is validated by the zod schema there (`title`, `description`, `pubDate` required; `updatedDate`, `heroImage` optional); import `z` from `astro/zod` (Zod 4). Adding a frontmatter field requires updating that schema and the `BlogPost` layout props. Entries are identified by `post.id` (there is no `slug`), and rendered with `render(post)` from `astro:content`.
- **Routing**: file-based in `src/pages/`. `blog/[...slug].astro` generates one static page per post via `getStaticPaths()` and renders it inside `src/layouts/BlogPost.astro`. `blog/index.astro` lists posts sorted by `pubDate`; `rss.xml.js` builds the feed from the same collection.
- **Shared head/meta**: every page includes `BaseHead.astro`, which imports `src/styles/global.css` (so global styles are loaded through it, not per page) and emits the canonical URL, title and description (no OpenGraph/Twitter tags; its `image` prop is currently unused). Canonical URLs use `site` from `astro.config.mjs`, which is still the placeholder `https://example.com`.
- **Site constants**: `SITE_TITLE` / `SITE_DESCRIPTION` in `src/consts.ts` are used by the header, index pages, and RSS.
- **Styling**: plain CSS only (no Sass) — component styles go in scoped `<style>` blocks in the `.astro` file. Parent scoped styles reach a child component's root element only if the child spreads its props onto it (as `HeaderLink.astro` does with `{...props}`), which is how `Header`'s `nav a.active` rule styles the links. Design tokens (colors, shadows) are CSS custom properties in `global.css`; some are raw RGB triplets meant to be used as `rgb(var(--gray))` / `rgba(var(--black), 5%)`.
- Static assets (images, fonts, favicon) are in `public/` and referenced by absolute path (e.g. `/blog-placeholder-1.jpg`).
