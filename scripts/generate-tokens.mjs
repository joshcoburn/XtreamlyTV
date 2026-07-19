import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(await readFile(path.join(root, 'packages/design-tokens/tokens.json'), 'utf8'));

const css = `/* Generated from packages/design-tokens/tokens.json. */\n:root {\n` +
  `  --brand-accent: ${tokens.brand.accent};\n` +
  `  --brand-accent-secondary: ${tokens.brand.accentSecondary};\n` +
  `  --brand-background: ${tokens.brand.background};\n` +
  `  --brand-surface: ${tokens.brand.surface};\n` +
  `  --brand-text: ${tokens.brand.text};\n` +
  `  --brand-muted: ${tokens.brand.muted};\n` +
  `  --brand-danger: ${tokens.brand.danger};\n` +
  `  --safe-inset: ${tokens.layout.safeInset}px;\n` +
  `  --card-radius: ${tokens.layout.cardRadius}px;\n` +
  `  --focus-ring: ${tokens.layout.focusRing}px;\n` +
  `  --sidebar-width: ${tokens.layout.sidebarWidth}px;\n` +
  `  --focus-duration: ${tokens.motion.focusMs}ms;\n` +
  `}\n`;
const cssDir = path.join(root, 'apps/webos/app/css');
await mkdir(cssDir, { recursive: true });
await writeFile(path.join(cssDir, 'tokens.css'), css);

const kotlin = `// Generated from packages/design-tokens/tokens.json.\npackage com.xtreamlytv.androidtv.ui.theme\n\nimport androidx.compose.ui.graphics.Color\n\nobject BrandTokens {\n` +
  `    val Accent = Color(0xFF${tokens.brand.accent.slice(1).toUpperCase()})\n` +
  `    val AccentSecondary = Color(0xFF${tokens.brand.accentSecondary.slice(1).toUpperCase()})\n` +
  `    val Background = Color(0xFF${tokens.brand.background.slice(1).toUpperCase()})\n` +
  `    val Surface = Color(0xFF${tokens.brand.surface.slice(1).toUpperCase()})\n` +
  `    val Text = Color(0xFF${tokens.brand.text.slice(1).toUpperCase()})\n` +
  `    val Muted = Color(0xFF${tokens.brand.muted.slice(1).toUpperCase()})\n` +
  `    val Danger = Color(0xFF${tokens.brand.danger.slice(1).toUpperCase()})\n` +
  `    const val CardRadius = ${tokens.layout.cardRadius}\n` +
  `}\n`;
const ktDir = path.join(root, 'apps/android-tv/app/src/main/java/com/xtreamlytv/androidtv/ui/theme');
await mkdir(ktDir, { recursive: true });
await writeFile(path.join(ktDir, 'BrandTokens.kt'), kotlin);
console.log('Generated webOS CSS and Android Compose design tokens.');
