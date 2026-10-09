import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
	}),
});

const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		startDate: z.coerce.date(),
		// Omit for ongoing projects
		endDate: z.coerce.date().optional(),
		role: z.string().optional(),
		tech: z.array(z.string()).default([]),
		repoUrl: z.url().optional(),
		liveUrl: z.url().optional(),
		heroImage: z.string().optional(),
		// Featured projects are listed first
		featured: z.boolean().default(false),
	}),
});

export const collections = { blog, projects };
