import { readdir, writeFile } from 'node:fs/promises';

const ORIGIN = 'https://www.pilotcompatible.com';
const postsDirectory = new URL('../posts/', import.meta.url);
const sitemapFile = new URL('../public/sitemap.xml', import.meta.url);

// Match the flat Markdown collection used by the blog's import.meta.glob.
const postFiles = (await readdir(postsDirectory, { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
  .map(entry => entry.name)
  .sort();

const paths = [
  '/',
  '/blog/',
  ...postFiles.map(filename => `/blog/${encodeURIComponent(filename.slice(0, -3))}`),
];

const urls = paths.map(path => `  <url>
    <loc>${ORIGIN}${path}</loc>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n');

await writeFile(sitemapFile, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`);

console.log(`Generated sitemap with ${paths.length} URLs.`);
