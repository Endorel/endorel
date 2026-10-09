# endorel.se

[![CI](https://github.com/Endorel/endorel/actions/workflows/ci.yml/badge.svg)](https://github.com/Endorel/endorel/actions/workflows/ci.yml)

Source for [endorel.se](https://endorel.se), the portfolio and blog of Hélène Francke, fullstack developer.

## Stack

- **[Astro 7](https://astro.build) with static output.** A portfolio is mostly content, so every page is pre-rendered HTML with almost no client-side JavaScript. That keeps the site fast, easy for search engines to index, and cheap to host anywhere.
- **Content collections.** Blog posts and projects are Markdown/MDX files with frontmatter validated by Zod schemas in [`src/content.config.ts`](src/content.config.ts). A missing field or malformed date fails the build, not the live site.
- **Plain CSS in scoped `<style>` blocks.** Modern CSS covers nesting, custom properties and container queries, and Astro scopes component styles automatically, so there's no preprocessor. Shared design tokens are CSS custom properties in [`src/styles/global.css`](src/styles/global.css).
- **TypeScript in strict mode**, checked by `astro check` as part of every build.

## Development

Requires Node 22.12 or later.

```sh
npm install
npm run dev       # dev server at http://localhost:4321
npm run build     # type-check, then build to dist/
npm run preview   # serve the built site locally
```

## Quality checks

| Command          | What it does                                                      |
| :--------------- | :---------------------------------------------------------------- |
| `npm run lint`   | ESLint with the JavaScript, typescript-eslint and Astro rule sets |
| `npm run format` | Format with Prettier (`format:check` only checks)                 |
| `npm test`       | Build, then run the Playwright tests against the built site       |

The Playwright tests find every page through the generated sitemap, so new posts and projects are covered without writing new tests. They check that:

- every page renders with a title, a single `<h1>` and the correct canonical URL
- navigation highlights the current section
- internal links and images resolve
- there are no [axe](https://github.com/dequelabs/axe-core) WCAG 2.2 AA accessibility violations
- the RSS feed lists every post

Before running the tests for the first time, install the browser with `npx playwright install chromium`.

[CI](.github/workflows/ci.yml) runs lint, the format check, the build and the Playwright tests on every pull request and push to `main`. [Dependabot](.github/dependabot.yml) opens weekly dependency update PRs, which go through the same checks.

## Adding content

### Blog post

Create a `.md` or `.mdx` file in `src/content/blog/`. The file name becomes the URL, so `my-post.md` is published at `/blog/my-post/`.

```md
---
title: 'Post title'
description: 'One-sentence summary, used in listings, meta tags and RSS'
pubDate: '2026-10-09'
updatedDate: '2026-10-10' # optional
heroImage: '/my-image.jpg' # optional, from public/
---

Start body headings at `##`: the layout renders the title as the page's `<h1>`.
```

### Project

Create a `.md` or `.mdx` file in `src/content/projects/`. It's published at `/projects/<file-name>/` and listed on `/projects`.

```md
---
title: 'Project name'
description: 'One-sentence summary for the project card'
startDate: '2025-03-01'
endDate: '2025-09-30' # optional; leave out for ongoing projects
role: 'Lead frontend developer' # optional
tech: ['TypeScript', 'React'] # optional
repoUrl: 'https://github.com/…' # optional
liveUrl: 'https://…' # optional
heroImage: '/my-project.jpg' # optional, from public/
featured: true # optional; featured projects are listed first
---

What the project was, what you did and what came of it.
```

## Credit

Built from the [Astro blog starter](https://github.com/withastro/astro/tree/main/examples/blog), which is based on the lovely [Bear Blog](https://github.com/HermanMartinus/bearblog/).

## License

[MIT](LICENSE)
