import { resolve } from 'path'
import { defineConfig } from 'vite'

/**
 * Dev-only plugin that mirrors the Netlify _redirects rule:
 *   /blog/:slug  →  /blog/post.html  (200 rewrite)
 *
 * Without this, Vite falls through to the SPA fallback and serves index.html
 * instead of the blog post renderer when you click a post link in dev mode.
 */
function blogDevRewritePlugin() {
  return {
    name: 'blog-dev-rewrite',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        // Match /blog/<slug> where slug has no dots (not a file) and no extra slashes
        if (/^\/blog\/[^./]+\/?$/.test(req.url)) {
          req.url = '/blog/post.html';
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [blogDevRewritePlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        blog: resolve(__dirname, 'blog/index.html'),
        post: resolve(__dirname, 'blog/post.html'),
      },
    },
  },
})
