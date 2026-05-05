import { marked } from 'marked';

/**
 * Parse YAML-style frontmatter from a raw markdown string.
 * Handles the simple key: value pairs used in our blog posts.
 * Replaces gray-matter, which requires Node.js Buffer (not available in browsers).
 */
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const data = {};
  for (const line of match[1].split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, content: match[2].trim() };
}

// Lazy glob — only the requested post's markdown is loaded
const postFiles = import.meta.glob('/posts/*.md', { query: '?raw', import: 'default' });

// Extract slug from clean URL: /blog/my-post-slug → my-post-slug
const slug = window.location.pathname.replace(/^\/blog\//, '').replace(/\/$/, '');
const loader = postFiles[`/posts/${slug}.md`];

const root = document.getElementById('post-root');

if (!loader) {
  root.innerHTML =
    '<p class="post-not-found">Post not found. <a href="/blog/">← All posts</a></p>';
} else {
  loader().then(raw => {
    const { data, content } = parseFrontmatter(raw);

    // Update page metadata
    document.title = `${data.title} — PilotCompatible`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', data.description ?? '');

    // Format date
    const dateDisplay = data.date
      ? new Date(data.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '';

    root.innerHTML = `
      <article class="post-article">
        <header class="post-header">
          <span class="post-category">${data.category ?? ''}</span>
          <h1>${data.title}</h1>
          <div class="post-byline">
            <time datetime="${data.date ?? ''}">${dateDisplay}</time>
            <span class="post-reading-time">${data.readingTime ?? ''}</span>
          </div>
        </header>
        <div class="post-body">${marked.parse(content)}</div>
      </article>
    `;
  });
}
