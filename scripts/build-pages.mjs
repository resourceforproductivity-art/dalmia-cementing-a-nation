import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/dalmia-cementing-a-nation';
const result = spawnSync(process.execPath, ['node_modules/next/dist/bin/next', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, GITHUB_PAGES: 'true', NEXT_PUBLIC_BASE_PATH: basePath },
});
if (result.status !== 0) process.exit(result.status ?? 1);
fs.writeFileSync('out/.nojekyll', '');
console.log(`GitHub Pages export ready in out/ for ${basePath}/`);
