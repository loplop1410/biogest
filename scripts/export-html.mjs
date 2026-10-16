import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
let html = await readFile(path.join(dist, 'index.html'), 'utf8');

async function readAsset(url) {
  if (/^(?:[a-z]+:)?\/\//i.test(url)) throw new Error('La entrega debe utilizar solo recursos locales.');
  const target = path.resolve(dist, url.replace(/^\//, ''));
  if (!target.startsWith(dist + path.sep)) throw new Error('Recurso fuera de dist.');
  return readFile(target, 'utf8');
}

let scripts = '';
for (const match of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/gi)) {
  const code = await readAsset(match[1]);
  // A classic inline script works directly from file:// without module requests.
  new Function(code);
  scripts += `\n<script>${code.replace(/<\/script/gi, '<\\/script')}</script>`;
  html = html.replace(match[0], '');
}
if (!scripts) throw new Error('No se encontró el JavaScript de la aplicación.');

for (const match of html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/gi)) {
  const css = await readAsset(match[1]);
  html = html.replace(match[0], `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
}

if (/<(?:script|link)\b[^>]*(?:src|href)="[^"#]/i.test(html)) {
  throw new Error('La entrega todavía contiene recursos externos.');
}
html = html.replace('</body>', `<noscript>Activa JavaScript y abre este archivo en Chrome o Edge para utilizar BioGest.</noscript>${scripts}\n</body>`);
html = html.replace('<html lang="es">', '<html lang="es" data-edition="portable">');
const outDir = path.join(root, 'entrega');
await mkdir(outDir, { recursive: true });
const target = path.join(outDir, 'BioGest.html');
await writeFile(target, html, 'utf8');
console.log(`HTML autónomo generado: ${target} (${Math.round(Buffer.byteLength(html) / 1024)} KB)`);
