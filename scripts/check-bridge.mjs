import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
JSON.parse(await readFile(new URL('../apps/api-bridge/package.json', import.meta.url), 'utf8'));
new vm.Script(await readFile(new URL('../apps/api-bridge/index.js', import.meta.url), 'utf8'), { filename: 'apps/api-bridge/index.js' });
console.log('Validated API bridge package metadata and JavaScript syntax.');
