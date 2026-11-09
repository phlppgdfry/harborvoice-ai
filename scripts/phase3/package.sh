#!/usr/bin/env bash
set -euo pipefail
# Run from repository root after verify.sh. No registry or release publication.
mkdir -p var/phase3/releases
npm pack ./packages/agentops-kit --pack-destination var/phase3/releases --json > var/phase3/releases/package-manifest.json
node --input-type=module <<'JS'
import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
const dir=mkdtempSync(join(tmpdir(),'agentops-package-'));
try {
 execFileSync('tar',['-xzf','var/phase3/releases/harborvoice-agentops-kit-0.1.0.tgz','-C',dir]);
 const output=execFileSync(process.execPath,[join(dir,'package/dist/cli.js'),'inspect',resolve('packages/agentops-kit/examples/config.json')],{encoding:'utf8'});
 if(JSON.parse(output).schemaVersion!==1)throw Error('Invalid packaged CLI result.');
 writeFileSync('var/phase3/releases/package-smoke.json',JSON.stringify({passed:true,scope:'Unpacked CLI executes with Node only, no installed dependencies or provider request.'},null,2));
} finally {rmSync(dir,{recursive:true,force:true});}
JS
python3 - <<'PY'
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
root=Path('apps/agentproof/dist')
with ZipFile('var/phase3/releases/agentproof-pilot-0.1.0.zip','w',ZIP_DEFLATED) as out:
 for p in sorted(root.rglob('*')):
  if p.is_file():out.write(p,p.relative_to(root))
PY
