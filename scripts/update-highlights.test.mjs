import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize, render } from './update-highlights.mjs';

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
  const stats = { followers: 7, publicRepositories: 3, stars: 10, forks: 2 };
  for (const mobile of [false, true]) {
    const svg = render(stats, '2026-09-23T00:00:00Z', mobile);
    assert.match(svg, /07:00 WIB/);
    assert.match(svg, /Followers: 7/);
    assert.match(svg, mobile ? /viewBox="0 0 400 340"/ : /viewBox="0 0 1000 236"/);
  }
});
