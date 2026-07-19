import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFile(path.join(root, relativePath), 'utf8');

const rootBuild = await read('apps/android-tv/build.gradle.kts');
const appBuild = await read('apps/android-tv/app/build.gradle.kts');
const wrapper = await read('apps/android-tv/gradle/wrapper/gradle-wrapper.properties');

const required = [
  [rootBuild, 'version "8.10.1"', 'Android Gradle Plugin 8.10.1'],
  [rootBuild, 'version "2.2.21"', 'Kotlin 2.2.21'],
  [wrapper, 'gradle-8.14.3-bin.zip', 'Gradle 8.14.3'],
  [appBuild, 'compileSdk = 36', 'compileSdk 36'],
  [appBuild, 'targetSdk = 36', 'targetSdk 36'],
  [appBuild, 'compose-bom:2025.08.01', 'Compose BOM 2025.08.01'],
  [appBuild, 'lifecycle-runtime-compose:2.9.2', 'Lifecycle 2.9.2'],
];

for (const [content, token, label] of required) {
  if (!content.includes(token)) throw new Error(`Android toolchain drift: expected ${label}.`);
}

const dynamicVersion = /(?:implementation|api|testImplementation|androidTestImplementation|debugImplementation)\([^\n]*(?:\+|latest\.(?:release|integration))/;
if (dynamicVersion.test(appBuild)) throw new Error('Dynamic Android dependency versions are not allowed.');

try {
  await access(path.join(root, 'apps/android-tv/gradle/wrapper/gradle-wrapper.jar'));
} catch {
  throw new Error('apps/android-tv/gradle/wrapper/gradle-wrapper.jar is missing. Commit the Gradle wrapper JAR.');
}

console.log('Android toolchain is pinned: AGP 8.10.1, Kotlin 2.2.21, Gradle 8.14.3, API 36.');
