import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

const expected = {
  '480p.mp4': '4c1be5e8b0549dfdd05ff79abc8688e94d7c4e21821d02d0e348f62da3e13d78',
  '720p.mp4': 'bd6368cc7408cd277c5b0f7a0120710486cd324bd05b32d8211c14844808ea77',
};
const report = { originals: [], encodes: [], posterBytes: fs.statSync('public/images/film-poster.webp').size };
for (const [file, expectedHash] of Object.entries(expected)) {
  if (!fs.existsSync(file)) continue; // Masters are intentionally local-only.
  const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if (hash !== expectedHash) throw new Error(`Master was modified: ${file}`);
  report.originals.push({ file, sha256: hash, preserved: true });
}
const webFiles = fs.readdirSync('public/videos').filter(file => file.endsWith('.mp4'));
if (webFiles.length !== 1) throw new Error('Exactly one 720p MP4 file must be served.');
for (const file of webFiles) {
  if (file !== 'cementing-a-nation-720p.mp4') throw new Error(`Unexpected web video: ${file}`);
  const path = `public/videos/${file}`;
  const bytes = fs.readFileSync(path);
  const boxes = [];
  for (let offset = 0; offset + 8 <= bytes.length;) {
    const size = bytes.readUInt32BE(offset);
    boxes.push(bytes.toString('ascii', offset + 4, offset + 8));
    if (!size) break;
    offset += size === 1 ? Number(bytes.readBigUInt64BE(offset + 8)) : size;
  }
  if (boxes.indexOf('moov') < 0 || boxes.indexOf('moov') > boxes.indexOf('mdat')) throw new Error('faststart metadata missing');
  const inspect = spawnSync(ffmpeg, ['-hide_banner', '-i', path, '-vf', 'select=eq(pict_type\\,I),showinfo', '-fps_mode', 'passthrough', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 4e6 });
  if (inspect.status !== 0) throw new Error(inspect.stderr);
  const times = [...inspect.stderr.matchAll(/n:\s*\d+.*?pts_time:([\d.]+)/g)].map(match => Number(match[1]));
  const intervals = times.slice(1).map((time, index) => time - times[index]);
  const maxGap = Math.max(...intervals);
  if (!times.length || maxGap > .501) throw new Error('Keyframes too far apart');
  const metadata = inspect.stderr.match(/Video: h264[^\n]+/)?.[0];
  if (!metadata?.includes('yuv420p') || !metadata.includes('24 fps')) throw new Error('Codec, format or frame rate changed');
  report.encodes.push({ file, bytes: bytes.length, metadata: metadata.trim(), keyframeCount: times.length, maxKeyframeIntervalSeconds: Number(maxGap.toFixed(4)), faststart: true });
}
fs.mkdirSync('artifacts', { recursive: true });
fs.writeFileSync('artifacts/video-validation.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
