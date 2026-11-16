#!/usr/bin/env node
/**
 * Copia android/app/google-services.<env>.json sobre google-services.json
 * para que el plugin de Google Services (Android Gradle) levante el proyecto
 * Firebase correcto por entorno.
 *
 * Uso:  node script/swap-google-services.js <dev|prod|qa>
 *
 * Los archivos por entorno deben existir en android/app/. Si falta el del
 * entorno solicitado, el script aborta con código 1 — preferimos un build
 * roto explícito que un build silencioso con la config equivocada.
 */
const fs = require('fs');
const path = require('path');

const env = process.argv[2];
if (!env) {
    console.error('[swap-google-services] falta argumento de entorno (dev|prod|qa)');
    process.exit(1);
}

const root = path.resolve(__dirname, '..');
const srcPath = path.join(root, 'android', 'app', `google-services.${env}.json`);
const dstPath = path.join(root, 'android', 'app', 'google-services.json');

if (!fs.existsSync(srcPath)) {
    console.error(`[swap-google-services] no encontrado: ${srcPath}`);
    console.error('  Asegurate de tener google-services.<env>.json para cada entorno que uses.');
    process.exit(1);
}

fs.copyFileSync(srcPath, dstPath);
const meta = JSON.parse(fs.readFileSync(dstPath, 'utf8'));
console.log(
    `[swap-google-services] env=${env} → project_id=${meta?.project_info?.project_id} ` +
    `(${path.relative(root, srcPath)} → ${path.relative(root, dstPath)})`,
);
