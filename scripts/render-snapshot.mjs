import { readFile, writeFile } from 'node:fs/promises';
import { render } from './update-highlights.mjs';

const snapshot = JSON.parse(await readFile(new URL('../assets/github-highlights.json', import.meta.url), 'utf8'));
await Promise.all([
  writeFile(new URL('../assets/github-highlights.svg', import.meta.url), render(snapshot, snapshot.updatedAt)),
  writeFile(new URL('../assets/github-highlights-mobile.svg', import.meta.url), render(snapshot, snapshot.updatedAt, true)),
]);
