// Leonida Ledger — hand-in program for the gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// The guide itself is the static web app in app/ (open app/index.html in a browser; it works fully
// offline). This program is only the courier: it copies app/ and screenshots/ into the output
// directory and writes dossier.json there with buildDossier from vendor/makefun-frontend.ts, the
// kit's library, which must stay byte-identical because the scorer rebuilds the dossier with its
// own copy and compares the two byte for byte.
//
// Run it the way the grader does, or locally with MAKEFUN_OUTPUT_DIR standing in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps below are the scorer's own (reference/gate.json), passed so a hand-in this program
// writes is one the scorer accepts: at most 4 screenshots of at most 256 KiB each, at most 993
// files and directories in app/, at most 48 MiB of app files, dossier text capped at 160 KiB.
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);

const shotCount = readdirSync(join(outputDir, 'screenshots')).length;
console.log(`Leonida Ledger handed in: app/ and ${shotCount} screenshot(s) copied, dossier.json written to ${outputDir}`);
