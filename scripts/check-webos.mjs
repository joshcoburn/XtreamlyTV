import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = path.join(root, 'apps/webos/app');
JSON.parse(await readFile(path.join(app, 'appinfo.json'), 'utf8'));
const files = (await readdir(path.join(app, 'js'))).filter((name) => name.endsWith('.js'));
for (const name of files) {
  const source = await readFile(path.join(app, 'js', name), 'utf8');
  new vm.Script(source, { filename: name });
}
console.log(`Validated appinfo.json and ${files.length} webOS JavaScript files.`);
