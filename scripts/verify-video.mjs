import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

const expected = {
  '480p.mp4': '9a59974c2d0c65005bef6cd2d4c05865aa59038d3818effb05bcd6a3247fe947',
};
const report = { originals: [], encodes: [], posterBytes: fs.statSync('public/images/film-poster-v2.webp').size };
for (const [file, expectedHash] of Object.entries(expected)) {
  if (!fs.existsSync(file)) continue; // Masters are intentionally local-only.
  const hash = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if (hash !== expectedHash) throw new Error(`Master was modified: ${file}`);
  report.originals.push({ file, sha256: hash, preserved: true });
}
const webFiles = fs.readdirSync('public/videos').filter(file => file.endsWith('.mp4'));
if (webFiles.length !== 1) throw new Error('Exactly one 480p MP4 file must be served.');
for (const file of webFiles) {
  if (file !== 'cementing-a-nation-v2-480p.mp4') throw new Error(`Unexpected web video: ${file}`);
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
  if (!metadata?.includes('yuv420p') || !metadata.includes('24 fps') || !metadata.includes('854x480')) throw new Error('Codec, format or frame rate changed');
  const duration = inspect.stderr.match(/Duration: (\d+):(\d+):([\d.]+)/);
  const seconds = duration ? Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]) : 0;
  if (seconds < 29.6 || seconds > 29.8) throw new Error('The full replacement film must be preserved');
  report.encodes.push({ durationSeconds: seconds, file, bytes: bytes.length, metadata: metadata.trim(), keyframeCount: times.length, maxKeyframeIntervalSeconds: Number(maxGap.toFixed(4)), faststart: true });
}
fs.mkdirSync('artifacts', { recursive: true });
fs.writeFileSync('artifacts/video-validation.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
