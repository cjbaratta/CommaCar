import { blogPosts } from './data/blog-posts.js';

function postCard(post) {
  return `
    <article class="post-card">
      <a href="/blog/${post.slug}.html" class="post-card-link">
        <div class="post-card-meta">
          <span class="post-category">${post.category}</span>
          <span class="post-reading-time">${post.readingTime}</span>
        </div>
        <h2 class="post-card-title">${post.title}</h2>
        <p class="post-card-excerpt">${post.excerpt}</p>
        <div class="post-card-footer">
          <time datetime="${post.date}">${post.dateDisplay}</time>
          <span class="post-card-cta">Read more →</span>
        </div>
      </a>
    </article>
  `;
}

const listing = document.querySelector('#blog-listing');
if (listing) {
  listing.innerHTML = blogPosts.map(postCard).join('');
}
