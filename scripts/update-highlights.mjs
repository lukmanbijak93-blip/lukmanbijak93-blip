import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { fetchContributions } from './contributions.mjs';
import { c, mono, text, icon, tile, card, ping, delay, svg } from './theme.mjs';

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
  const height = mobile ? 634 : 346;
  const edge = mobile ? 20 : 24;
  const date = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(updatedAt));
  const format = value => value.toLocaleString('en-US');
  const metrics = [[stats.publicRepositories, 'Repositori publik', 'book'], [stats.followers, 'Followers', 'users'], [stats.stars, 'Stars', 'star'], [stats.forks, 'Forks', 'fork']];
  const contributionMetrics = [[stats.totalContributions, 'Total kontribusi'], [stats.currentStreak, 'Streak saat ini'], [stats.longestStreak, 'Streak terpanjang']];
  const share = stats.longestStreak ? Math.min(1, stats.currentStreak / stats.longestStreak) : 0;
  const days = (x, y, value, size) => `<text x="${x}" y="${y}" font-size="${size}" font-weight="700" fill="${c.text}">${format(value)}<tspan dx="7" font-size="14" font-weight="400" fill="${c.mid}">hari</tspan></text>`;
  const group = (x, y, i, content) => `<g transform="translate(${x} ${y})"><g class="in"${delay(i * 0.08)}>\n${content}\n</g></g>`;

  const heroWidth = mobile ? 360 : 380;
  const hero = group(edge, mobile ? 82 : 64, 0, `${card(heroWidth, mobile ? 126 : 150)}
${tile(20, 20, 40, 'activity')}
${text(72, 45, 'Total kontribusi', { size: 15 })}
${text(20, mobile ? 104 : 114, format(stats.totalContributions), { size: mobile ? 46 : 54, weight: 700, fill: c.text, ls: -1 })}
${mobile ? '' : text(20, 136, 'Sejak akun dibuat', { size: 12.5, fill: c.low })}`);

  const streakWidth = mobile ? 172 : 270;
  const barWidth = streakWidth - 40;
  const streak = (i, value, label, name, caption, bar) => {
    const x = mobile ? edge + i * 188 : 420 + i * 286;
    const top = mobile ? 0 : -2;
    return group(x, mobile ? 224 : 64, i + 1, `${card(streakWidth, mobile ? 162 : 150)}
${tile(20, 20, mobile ? 36 : 40, name)}
${mobile ? '' : text(72, 45, label, { size: 15 })}
${days(20, top + 98, value, mobile ? 34 : 38)}
${mobile ? text(20, 119, label, { size: 13.5 }) : ''}
${bar === null ? '' : `<rect x="20" y="${top + (mobile ? 130 : 114)}" width="${barWidth}" height="6" rx="3" fill="${c.track}"/>${bar > 0 ? `<rect x="20" y="${top + (mobile ? 130 : 114)}" width="${Math.max(6, Math.round(barWidth * bar))}" height="6" rx="3" fill="url(#ac)" class="grow"/>` : ''}`}
${text(20, top + (mobile ? 152 : 138), caption, { size: 12.5, fill: c.low })}`);
  };
  const streaks = [
    streak(0, stats.currentStreak, 'Streak saat ini', 'flame', `${Math.round(share * 100)}% dari rekor`, share),
    streak(1, stats.longestStreak, 'Streak terpanjang', 'award', 'Rekor pribadi', null),
  ].join('\n');

  const tiles = metrics.map(([value, label, name], i) => mobile
    ? group(edge + (i % 2) * 188, 402 + Math.floor(i / 2) * 82, i + 3, `${card(172, 70, { radius: 12 })}
${text(16, 32, format(value), { size: 21, weight: 700, fill: c.text })}
${text(16, 54, label, { size: 13 })}
${icon(name, 138, 16, 18, c.low)}`)
    : group(edge + i * 242, 230, i + 3, `${card(226, 60, { radius: 12 })}
${icon(name, 18, 21, 18, c.low)}
${text(46, 35, label, { size: 14 })}
${text(208, 37.5, format(value), { size: 21, weight: 700, fill: c.text, anchor: 'end' })}`)).join('\n');

  const notes = mobile
    ? ['Kontribusi sejak akun dibuat; streak harian (UTC).', `Kalender sampai ${stats.contributionsThrough}.`, 'Stars & forks: repositori publik non-fork.']
    : [`Kontribusi sejak akun dibuat · streak harian (UTC) · kalender sampai ${stats.contributionsThrough} · stars & forks dari repositori publik non-fork`];
  const header = mobile
    ? `${text(edge, 40, 'GITHUB HIGHLIGHTS', { size: 12, weight: 700, fill: c.teal, font: mono, ls: 1.6 })}
${text(edge, 62, `Diperbarui ${date} WIB`, { size: 12.5, fill: c.low })}${ping(width - edge - 5, 36)}`
    : `${text(edge, 43, 'GITHUB HIGHLIGHTS', { size: 12.5, weight: 700, fill: c.teal, font: mono, ls: 1.6 })}
${text(width - edge - 18, 43, `Diperbarui ${date} WIB`, { size: 13, fill: c.low, anchor: 'end' })}${ping(width - edge - 5, 38.5)}`;

  return svg(width, height, {
    title: `GitHub Highlights: ${username}`,
    desc: `${[...contributionMetrics, ...metrics].map(([v, label]) => `${label}: ${v}`).join('. ')}. Streak dalam hari. Kalender sejak ${stats.contributionsFrom} sampai ${stats.contributionsThrough}, UTC. Sinkronisasi ${date} WIB.`,
    body: `${header}
${hero}
${streaks}
${tiles}
${notes.map((note, i) => text(edge, height - 16 - (notes.length - 1 - i) * 16, note, { size: mobile ? 11.5 : 12, fill: c.low })).join('\n')}`,
  });
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
  const now = new Date();
  const stats = { ...summarize(user, repositories), ...await fetchContributions(username, user.created_at, now, process.env.GITHUB_TOKEN) };
  const updatedAt = now.toISOString();
  const outputDirectory = resolve(process.env.PROFILE_OUTPUT_DIR || fileURLToPath(new URL('../assets/', import.meta.url)));
  await mkdir(outputDirectory, { recursive: true });
  await Promise.all([
    writeFile(resolve(outputDirectory, 'github-highlights.svg'), render(stats, updatedAt)),
    writeFile(resolve(outputDirectory, 'github-highlights-mobile.svg'), render(stats, updatedAt, true)),
    writeFile(resolve(outputDirectory, 'github-highlights.json'), JSON.stringify({ username, updatedAt, ...stats }, null, 2) + '\n'),
  ]);
  console.log(`Updated public statistics for ${username} at ${updatedAt}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
