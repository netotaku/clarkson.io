import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';

export default defineConfig({
	site: 'https://clar.ky',
	devToolbar: {
		enabled: false,
	},
	integrations: [mdx(), sitemap(), vue()],
	vite: {
		optimizeDeps: {
			force: true,
		},
	},
});
