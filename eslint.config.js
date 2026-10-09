import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
	{ ignores: ['dist/', '.astro/'] },
	js.configs.recommended,
	tseslint.configs.recommended,
	astro.configs.recommended,
	{
		languageOptions: {
			globals: { ...globals.node, ...globals.browser },
		},
	},
	prettier,
);
