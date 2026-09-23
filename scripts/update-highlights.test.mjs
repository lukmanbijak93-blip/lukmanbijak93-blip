import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize, render } from './update-highlights.mjs';
import { summarizeContributions, parseCalendar, fetchContributions } from './contributions.mjs';

test('counts stars and forks only on owned non-fork repositories', () => {
  assert.deepEqual(summarize({ followers: 7, public_repos: 3 }, [
    { fork: false, stargazers_count: 4, forks_count: 2 },
    { fork: false, stargazers_count: 6, forks_count: 1 },
    { fork: true, stargazers_count: 900, forks_count: 800 },
  ]), { followers: 7, publicRepositories: 3, stars: 10, forks: 3 });
});
test('zero activity is represented honestly', () => {
  assert.deepEqual(summarize({ followers: 0, public_repos: 0 }, []), { followers: 0, publicRepositories: 0, stars: 0, forks: 0 });
});
test('invalid API data fails instead of publishing false zeroes', () => {
  assert.throws(() => summarize({}, []));
  assert.throws(() => summarize({ followers: 1, public_repos: 1 }, [{ fork: false }]));
});
test('both sizes identify metrics and show a Jakarta timestamp', () => {
  const stats = { followers: 7, publicRepositories: 3, stars: 10, forks: 2, totalContributions: 12, currentStreak: 2, longestStreak: 3, contributionsFrom: '2026-01-01', contributionsThrough: '2026-09-23' };
  for (const mobile of [false, true]) {
    const svg = render(stats, '2026-09-23T00:00:00Z', mobile);
    assert.match(svg, /07:00 WIB/);
    assert.match(svg, /Followers: 7/);
    assert.match(svg, /Total kontribusi: 12/);
    assert.match(svg, /Streak saat ini: 2/);
    assert.match(svg, /Streak terpanjang: 3/);
    assert.match(svg, mobile ? /viewBox="0 0 400 686"/ : /viewBox="0 0 1000 396"/);
  }
});

const calendar = (counts, start = '2025-12-29') => counts.map((contributionCount, index) => ({
  date: new Date(Date.parse(`${start}T00:00:00Z`) + index * 86400000).toISOString().slice(0, 10), contributionCount,
}));

test('streak crosses year boundary and keeps yesterday streak while today is empty', () => {
  const stats = summarizeContributions(calendar([2, 4, 1, 3, 0]), '2025-12-29', '2026-01-02');
  assert.equal(stats.totalContributions, 10);
  assert.equal(stats.currentStreak, 4);
  assert.equal(stats.longestStreak, 4);
});
test('current streak resets after a missed full day and longest remains', () => {
  const stats = summarizeContributions(calendar([2, 1, 0, 0]), '2025-12-29', '2026-01-01');
  assert.equal(stats.currentStreak, 0);
  assert.equal(stats.longestStreak, 2);
});
test('counts today and ignores future days', () => {
  const stats = summarizeContributions(calendar([0, 1, 4, 0, 1, 99]), '2025-12-29', '2026-01-02');
  assert.equal(stats.currentStreak, 1);
  assert.equal(stats.longestStreak, 2);
  assert.equal(stats.totalContributions, 6);
});
test('empty and incomplete calendars cannot silently publish zeros', () => {
  assert.throws(() => summarizeContributions([], '2026-01-01', '2026-01-02'));
  const stats = summarizeContributions(calendar([0, 0]), '2025-12-29', '2025-12-30');
  assert.equal(stats.currentStreak, 0);
  assert.equal(stats.longestStreak, 0);
  assert.equal(stats.totalContributions, 0);
});
test('leap day participates in consecutive streak', () => {
  const stats = summarizeContributions(calendar([1, 1, 1], '2024-02-28'), '2024-02-28', '2024-03-01');
  assert.equal(stats.currentStreak, 3);
});
test('public calendar parses tooltip counts and rejects unknown markup', () => {
  assert.deepEqual(parseCalendar('<td id="d1" data-date="2026-01-01"></td><tool-tip for="d1">1,234 contributions on January 1st.</tool-tip>'), [{ date: '2026-01-01', contributionCount: 1234 }]);
  assert.throws(() => parseCalendar('<td id="d1" data-date="2026-01-01"></td>'));
  assert.throws(() => parseCalendar('Service unavailable'));
});

test('authenticated workflow fetches every year and joins the calendars', async t => {
  const requests = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.github.com/graphql');
    const { variables } = JSON.parse(options.body);
    requests.push(variables);
    const start = variables.from.slice(0, 10);
    const end = variables.to.slice(0, 10);
    const length = Math.floor((Date.parse(end) - Date.parse(start)) / 86400000) + 1;
    return { ok: true, json: async () => ({ data: { user: { contributionsCollection: { contributionCalendar: { weeks: [{ contributionDays: calendar(Array(length).fill(1), start) }] } } } } }) };
  });
  const stats = await fetchContributions('example', '2025-01-01T00:00:00Z', new Date('2026-01-02T12:00:00Z'), 'test-token');
  assert.equal(requests.length, 2);
  assert.equal(requests[0].to, '2025-12-31T23:59:59Z');
  assert.equal(requests[1].from, '2026-01-01T00:00:00Z');
  assert.equal(stats.totalContributions, 367);
  assert.equal(stats.longestStreak, 367);
});

test('GraphQL errors stop refresh even with HTTP 200', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: true, json: async () => ({ errors: [{ message: 'Denied' }] }) }));
  await assert.rejects(fetchContributions('example', '2026-01-01T00:00:00Z', new Date('2026-01-02T12:00:00Z'), 'test-token'), /Contribution query failed/);
});
