import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const pkg = JSON.parse(await read('package.json'));
const lock = JSON.parse(await read('package-lock.json'));
const changelog = await read('CHANGELOG.md');
const version = pkg.version;

if (!/^\d+\.\d+\.\d+$/.test(version)) throw Error('Usa una versión MAYOR.MENOR.CORRECCIÓN, por ejemplo 1.0.0.');
if (lock.version !== version || lock.packages?.['']?.version !== version) throw Error('package.json y package-lock.json deben tener la misma versión.');
const headings = [...changelog.matchAll(/^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})$/gm)];
if (headings[0]?.[1] !== version) throw Error(`La primera versión publicada del CHANGELOG debe ser ${version}, con su fecha.`);
if (new Set(headings.map(match => match[1])).size !== headings.length) throw Error('Hay versiones duplicadas en CHANGELOG.md.');
const ref = process.env.GITHUB_REF;
if (ref?.startsWith('refs/tags/') && ref !== `refs/tags/v${version}`) throw Error(`La etiqueta debe ser v${version}.`);

const start = headings[0].index + headings[0][0].length;
const end = headings[1]?.index ?? changelog.length;
const notes = changelog.slice(start, end).trim();
for (const section of ['Características', 'Cambios', 'Validación', 'Limitaciones']) {
  if (!notes.includes(`### ${section}`)) throw Error(`Falta la sección ${section} en las notas de ${version}.`);
}
if (process.argv.includes('--notes')) process.stdout.write(notes + '\n');
else console.log(`Versión ${version}: paquete, lockfile, historial y etiqueta coherentes.`);
