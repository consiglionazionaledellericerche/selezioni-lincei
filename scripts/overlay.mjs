#!/usr/bin/env node
/**
 * Prepara il sorgente di selezioni-lincei a partire da selezioni-online:
 *  1. copia selezioni-online (UPSTREAM_DIR, oppure il clone indicato in upstream.json) in .build/
 *  2. sovrascrive i file con quelli di overrides/ (stessa struttura di selezioni-online)
 *  3. unisce in profondità i file JSON di merge/ (traduzioni, manifest) con quelli di selezioni-online
 *  4. applica le sostituzioni di replace.json (testi puntuali, es. in index.html)
 * Uso: node scripts/overlay.mjs [--upstream <cartella selezioni-online>]
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const build = join(root, '.build');
const args = process.argv.slice(2);
const upstreamArg = args.includes('--upstream') ? args[args.indexOf('--upstream') + 1] : process.env.UPSTREAM_DIR;

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (value && typeof value === 'object' && !Array.isArray(value) &&
        target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

// 1. sorgente di selezioni-online
rmSync(build, { recursive: true, force: true });
if (upstreamArg) {
  const skip = new Set(['node_modules', '.angular', 'dist', '.git']);
  cpSync(upstreamArg, build, { recursive: true, filter: src => !skip.has(src.split(/[\\/]/).pop()) || src === upstreamArg });
  console.log(`selezioni-online da ${upstreamArg}`);
} else {
  const { repository, ref } = JSON.parse(readFileSync(join(root, 'upstream.json'), 'utf8'));
  execFileSync('git', ['clone', '--depth', '1', '--branch', ref, repository, build], { stdio: 'inherit' });
  rmSync(join(build, '.git'), { recursive: true, force: true });
  console.log(`selezioni-online da ${repository}#${ref}`);
}

// 2. file sostituiti
const overrides = join(root, 'overrides');
if (existsSync(overrides)) {
  for (const file of walk(overrides)) {
    const target = join(build, relative(overrides, file));
    mkdirSync(dirname(target), { recursive: true });
    cpSync(file, target);
    console.log(`  sostituito ${relative(overrides, file)}`);
  }
}

// 3. JSON uniti
const merge = join(root, 'merge');
if (existsSync(merge)) {
  for (const file of walk(merge)) {
    const rel = relative(merge, file);
    const target = join(build, rel);
    const base = existsSync(target) ? JSON.parse(readFileSync(target, 'utf8')) : {};
    writeFileSync(target, JSON.stringify(deepMerge(base, JSON.parse(readFileSync(file, 'utf8'))), null, 2) + '\n');
    console.log(`  unito ${rel}`);
  }
}

// 4. sostituzioni puntuali
const replacements = existsSync(join(root, 'replace.json')) ? JSON.parse(readFileSync(join(root, 'replace.json'), 'utf8')) : [];
for (const item of replacements) {
  const target = join(build, item.file);
  const text = readFileSync(target, 'utf8');
  const updated = item.regex ? text.replace(new RegExp(item.regex, 'g'), item.replace) : text.split(item.search).join(item.replace);
  if (updated === text) {
    console.warn(`  ATTENZIONE: nessuna corrispondenza in ${item.file} per ${item.search || item.regex}`);
  }
  writeFileSync(target, updated);
}
// 5. backend per lo sviluppo: API_URL=http://localhost:9090 npm start (sovrascrive apiUrl di env.js e il proxy)
if (process.env.API_URL) {
  const env = join(build, 'src/assets/env.js');
  writeFileSync(env, readFileSync(env, 'utf8').replace(/(\["apiUrl"\]\s*=\s*")[^"]*(")/, `$1${process.env.API_URL}$2`));
  const proxy = join(build, 'proxy.conf.js');
  if (existsSync(proxy)) {
    writeFileSync(proxy, readFileSync(proxy, 'utf8').replace(/http:\/\/localhost:\d+/g, process.env.API_URL));
  }
  console.log(`  backend ${process.env.API_URL}`);
}
console.log(`Sorgente pronto in ${relative(process.cwd(), build) || build}`);
