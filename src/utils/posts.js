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

const postFiles = import.meta.glob('/posts/*.md', { query: '?raw', import: 'default', eager: true });

export function getAllPosts() {
  return Object.entries(postFiles)
    .map(([filepath, raw]) => {
      const { data, content } = parseFrontmatter(raw);
      const slug = filepath.replace('/posts/', '').replace('.md', '');
      return { slug, content, ...data };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPostBySlug(slug) {
  return getAllPosts().find(p => p.slug === slug);
}
