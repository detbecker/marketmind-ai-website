import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { blogPosts } from '../src/data/blogPosts.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const outputPath = resolve(projectRoot, 'public', 'sitemap.xml');
const siteUrl = 'https://marketmind-ai.com';

const staticRoutes = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/details', changefreq: 'monthly', priority: '0.9' },
  { path: '/contact', changefreq: 'monthly', priority: '0.8' },
  { path: '/blog', changefreq: 'weekly', priority: '0.9' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
];

const blogRoutes = blogPosts.map((post) => ({
  path: `/blog/${post.slug}`,
  lastmod: post.date,
  changefreq: 'monthly',
  priority: '0.8',
}));

const urls = [...staticRoutes, ...blogRoutes]
  .map(({ path, lastmod, changefreq, priority }) => {
    const loc = path === '/' ? `${siteUrl}/` : `${siteUrl}${path}`;
    const tags = [`    <loc>${loc}</loc>`];

    if (lastmod) {
      tags.push(`    <lastmod>${lastmod}</lastmod>`);
    }

    tags.push(`    <changefreq>${changefreq}</changefreq>`);
    tags.push(`    <priority>${priority}</priority>`);

    return ['  <url>', ...tags, '  </url>'].join('\n');
  })
  .join('\n');

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  urls,
  '</urlset>',
  '',
].join('\n');

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, xml, 'utf8');

console.log(`Sitemap written to ${outputPath}`);