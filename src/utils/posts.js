import matter from 'gray-matter';

const postFiles = import.meta.glob('/posts/*.md', { query: '?raw', import: 'default', eager: true });

export function getAllPosts() {
  return Object.entries(postFiles)
    .map(([filepath, raw]) => {
      const { data, content } = matter(raw);
      const slug = filepath.replace('/posts/', '').replace('.md', '');
      return { slug, content, ...data };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPostBySlug(slug) {
  return getAllPosts().find(p => p.slug === slug);
}
