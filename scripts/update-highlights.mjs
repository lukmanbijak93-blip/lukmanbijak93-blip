import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const username = process.env.PROFILE_USERNAME || 'lukmanbijak93-blip';
if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) throw new Error('Invalid GitHub username');
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'profile-highlights' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function get(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`GitHub API returned ${response.status} for ${path}; existing assets will not be replaced.`);
  return response.json();
}

export function summarize(user, repositories) {
  if (!Number.isInteger(user.followers) || !Number.isInteger(user.public_repos) || !Array.isArray(repositories)) throw new Error('Invalid GitHub response');
  const owned = repositories.filter(repo => !repo.fork);
  for (const repo of owned) {
    if (!Number.isInteger(repo.stargazers_count) || !Number.isInteger(repo.forks_count)) throw new Error('Invalid repository counts');
  }
  return {
    followers: user.followers,
    publicRepositories: user.public_repos,
    stars: owned.reduce((total, repo) => total + repo.stargazers_count, 0),
    forks: owned.reduce((total, repo) => total + repo.forks_count, 0),
  };
}

export function render(stats, updatedAt, mobile = false) {
  const width = mobile ? 400 : 1000;
  const height = mobile ? 340 : 236;
  const date = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(updatedAt));
  const metrics = [[stats.publicRepositories, 'Repositori publik'], [stats.followers, 'Followers'], [stats.stars, 'Stars'], [stats.forks, 'Forks']];
  const cards = metrics.map(([value, label], i) => {
    const x = mobile ? 24 + (i % 2) * 184 : 28 + i * 244;
    const y = mobile ? 94 + Math.floor(i / 2) * 106 : 89;
    return `<g transform="translate(${x} ${y})"><rect width="${mobile ? 168 : 216}" height="90" rx="12" fill="#15344f"/><text x="18" y="39" font-size="30" font-weight="700" fill="#f0f6ff">${value.toLocaleString('en-US')}</text><text x="18" y="67" font-size="14" fill="#b9cee0">${label}</text></g>`;
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">GitHub Highlights: ${username}</title>
<desc id="desc">${metrics.map(([v, label]) => `${label}: ${v}`).join('. ')}. Sinkronisasi ${date} WIB. Stars dan forks dari repositori publik non-fork.</desc>
<rect width="${width}" height="${height}" rx="16" fill="#0d2035"/>
<g font-family="Segoe UI, Arial, sans-serif">
<text x="${mobile ? 24 : 28}" y="36" font-size="16" font-weight="700" letter-spacing="1" fill="#84ccff">GITHUB / PUBLIC ACTIVITY</text>
<text x="${mobile ? 24 : 28}" y="63" font-size="${mobile ? 12 : 14}" fill="#b9cee0">Sinkronisasi: ${date} WIB</text>
${cards}
<text x="${mobile ? 24 : 28}" y="${height - 19}" font-size="${mobile ? 11 : 13}" fill="#9ab3cb">Stars &amp; forks: repositori publik non-fork</text>
</g></svg>\n`;
}

async function main() {
  const user = await get(`/users/${username}`);
  const repositories = [];
  for (let page = 1; ; page++) {
    const batch = await get(`/users/${username}/repos?type=owner&per_page=100&page=${page}`);
    if (!Array.isArray(batch)) throw new Error('Invalid repository response');
    repositories.push(...batch);
    if (batch.length < 100) break;
  }
  const stats = summarize(user, repositories);
  const updatedAt = new Date().toISOString();
  await mkdir(new URL('../assets/', import.meta.url), { recursive: true });
  await Promise.all([
    writeFile(new URL('../assets/github-highlights.svg', import.meta.url), render(stats, updatedAt)),
    writeFile(new URL('../assets/github-highlights-mobile.svg', import.meta.url), render(stats, updatedAt, true)),
    writeFile(new URL('../assets/github-highlights.json', import.meta.url), JSON.stringify({ username, updatedAt, ...stats }, null, 2) + '\n'),
  ]);
  console.log(`Updated public statistics for ${username} at ${updatedAt}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
