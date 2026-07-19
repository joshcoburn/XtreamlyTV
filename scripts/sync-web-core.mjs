import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'packages', 'core-web', 'src');
const target = path.join(root, 'apps', 'webos', 'app', 'js');
await mkdir(target, { recursive: true });
for (const name of ['core.js', 'api.js', 'store.js']) {
  const content = await readFile(path.join(source, name), 'utf8');
  await writeFile(path.join(target, name), `/* Generated from packages/core-web/src/${name}. Do not edit this copy. */\n${content}`);
}
console.log('Synchronized shared web core into apps/webos/app/js.');
