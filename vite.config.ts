import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		proxy: {
			'/graphql': 'http://localhost:4000',
			'/upload': 'http://localhost:4000',
			'/file': 'http://localhost:4000'
		}
	}
});
