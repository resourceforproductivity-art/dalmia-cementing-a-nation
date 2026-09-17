import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

const sources = ['720p.mp4'];
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const originals = sources.map(file => ({ file, hash: hash(file) }));
const run = args => {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'warning', ...args], { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`FFmpeg failed (${result.status})`);
};
for (const input of sources) {
  run(['-i', input, '-map', '0:v:0', '-an', '-c:v', 'libx264', '-preset', 'slow', '-tune', 'grain', '-crf', '20', '-pix_fmt', 'yuv420p', '-g', '8', '-keyint_min', '8', '-sc_threshold', '0', '-bf', '0', '-fps_mode', 'passthrough', '-map_metadata', '0', '-movflags', '+faststart', '-y', `public/videos/cementing-a-nation-${input}`]);
}
run(['-ss', '0.05', '-i', '720p.mp4', '-frames:v', '1', '-vf', 'scale=854:-2:flags=lanczos', '-c:v', 'libwebp', '-quality', '78', '-compression_level', '6', '-y', 'public/images/film-poster.webp']);
for (const source of originals) {
  if (source.hash !== hash(source.file)) throw new Error(`Master changed: ${source.file}`);
}
console.log('One 720p web encode and one lightweight poster generated. The source master is unchanged.');
