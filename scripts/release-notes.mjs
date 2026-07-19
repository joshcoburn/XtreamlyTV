import { readFile } from 'node:fs/promises';
const version = (await readFile(new URL('../VERSION', import.meta.url), 'utf8')).trim();
console.log(`# XtreamlyTV v${version}\n\nSee CHANGELOG.md for platform status and changes.`);
