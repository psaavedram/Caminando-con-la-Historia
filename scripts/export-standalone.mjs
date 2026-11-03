import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const mime = { '.svg':'image/svg+xml', '.png':'image/png', '.woff':'font/woff', '.woff2':'font/woff2' };
async function dataUrl(file) {
  const bytes = await readFile(file);
  return `data:${mime[path.extname(file)] || 'application/octet-stream'};base64,${bytes.toString('base64')}`;
}

let html = await readFile(path.join(dist,'index.html'),'utf8');
const script = html.match(/<script\b[^>]*src="([^"]+\.js)"[^>]*><\/script>/);
const stylesheet = html.match(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/);
if (!script || !stylesheet) throw new Error('No se encontraron el JavaScript y CSS compilados.');

const scriptPath = path.resolve(dist,script[1]);
const cssPath = path.resolve(dist,stylesheet[1]);
let js = await readFile(scriptPath,'utf8');
let css = await readFile(cssPath,'utf8');

// Embed every local CSS asset, including fonts and Leaflet control images.
for (const match of [...css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)]) {
  if (/^(data:|https?:|#)/.test(match[1])) continue;
  const url = await dataUrl(path.resolve(path.dirname(cssPath),match[1]));
  css = css.replaceAll(match[0],`url("${url}")`);
}

html = html.replace(script[0],'');
html = html.replace(/[\t ]+$/gm,'');
html = html.replace(stylesheet[0],()=>`<style>${css.replaceAll('</style','<\\/style')}</style>`);
html = html.replace(/<link\b[^>]*rel="manifest"[^>]*\/?\s*>/g,'');
const favicon = await dataUrl(path.join(dist,'favicon.svg'));
html = html.replace(/(<link\b[^>]*rel="icon"[^>]*href=")[^"]+("[^>]*>)/,(_,prefix,suffix)=>prefix+favicon+suffix);
html = html.replace('</body>',()=>`<script type="module">${js.replaceAll('</script','<\\/script')}</script></body>`);

const output = path.join(root,'prototipo.html');
await writeFile(output,html);
console.log(`Prototipo autónomo generado: ${output} (${Math.round(Buffer.byteLength(html)/1024)} KB)`);
