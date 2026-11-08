import {readFileSync,readdirSync,statSync} from 'node:fs';
import {strict as assert} from 'node:assert';
import {join} from 'node:path';
import type {Scenario,Report} from '../../packages/agentops-kit/src/index.js';
const corpus=JSON.parse(readFileSync('benchmarks/voice-ai/scenarios/corpus.json','utf8')) as Scenario[];
assert.equal(corpus.length,110);assert.equal(new Set(corpus.map(s=>s.id)).size,110);assert.equal(new Set(corpus.map(s=>s.input)).size,110);assert.equal(new Set(corpus.map(s=>s.category)).size,11);
for(const name of ['baseline','candidate']){
 const report=JSON.parse(readFileSync(`benchmarks/voice-ai/results/${name}.json`,'utf8')) as Report;
 assert.equal(report.results.length,110);assert.equal(report.results.filter(r=>r.passed).length,name==='baseline'?80:110);
 assert.ok(report.results.every(r=>r.evidenceType==='fixture'));assert.equal(report.costs.reportedCredits,0);
 assert.match(report.sourceCommit,/^[0-9a-f]{40}$/);assert.ok(report.limitations.length>=3);
}
const roots=['packages/agentops-kit/src','apps/agentproof/src','apps/agentproof/public','docs/phase3','community/elevenlabs-belgium','scripts/phase3'];
let scanned=0;
function scan(dir:string){for(const name of readdirSync(dir)){const p=join(dir,name);if(statSync(p).isDirectory()){scan(p);continue;}if(!/\.(ts|mjs|json|html|md|yml|sh|py|svg|css)$/.test(p))continue;const text=readFileSync(p,'utf8');assert.ok(!/sk_[a-zA-Z0-9]{25,}|sk-proj-[a-zA-Z0-9_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|[?&](?:X-Amz-Signature|xi-api-key)=/i.test(text),`Potential secret in ${p}`);scanned++;}}
roots.forEach(scan);
assert.equal(readdirSync('docs/phase3/articles').filter(f=>/^0\d-/.test(f)).length,5);
console.log(`Corpus/result invariants and limited secret-pattern scan passed (${scanned} text files). Not a complete secret or security audit.`);
