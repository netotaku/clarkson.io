import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	site: 'https://clar.ky',
	devToolbar: {
		enabled: false,
	},
	integrations: [mdx(), sitemap()],
	vite: {
		optimizeDeps: {
			force: true,
		},
	},
});
