import { access, readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
await Promise.all(['assets/github-contribution-grid-snake.svg', 'assets/github-contribution-grid-snake-dark.svg'].map(file => access(new URL(file, root))));
const file = new URL('README.md', root);
const readme = await readFile(file, 'utf8');
const region = /<!-- contribution-snake:start -->[\s\S]*?<!-- contribution-snake:end -->/;
if (!region.test(readme)) throw new Error('Contribution snake markers missing');
const markup = `<!-- contribution-snake:start -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/github-contribution-grid-snake-dark.svg" />
  <img src="./assets/github-contribution-grid-snake.svg" width="100%" alt="Animasi snake dari kalender kontribusi GitHub Lukman Bijak Bestari. Buka tautan Kalender kontribusi untuk melihat detail per hari." />
</picture>
<!-- contribution-snake:end -->`;
await writeFile(file, readme.replace(region, markup));
