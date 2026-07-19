import { mkdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = path.join(root, 'apps/webos/app');
const dist = path.join(root, 'dist/webos');
await mkdir(dist, { recursive: true });
const info = JSON.parse(await readFile(path.join(app, 'appinfo.json'), 'utf8'));
const args = ['--no-minify', '-o', dist, app];
const result = spawnSync('ares-package', args, { stdio: 'inherit', shell: process.platform === 'win32' });
if (result.error?.code === 'ENOENT') {
  console.error('ares-package was not found. Install it with: npm install -g @webos-tools/cli');
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Built ${info.id}_${info.version}_all.ipk`);
