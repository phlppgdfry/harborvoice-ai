import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {evaluate,report,version,type Scenario,type Transport,type Report} from '../../packages/agentops-kit/src/index.js';
const corpus=JSON.parse(readFileSync('benchmarks/voice-ai/scenarios/corpus.json','utf8')) as Scenario[];
// Intentional teaching stubs. These do not call an LLM and do not establish agent quality.
const policy:Record<string,{outcome:string;tools:string[]}>= {
 normal:{outcome:'grounded',tools:['lookup']},ambiguous:{outcome:'clarify',tools:[]},unknown:{outcome:'abstain',tools:[]},
 'tool-error':{outcome:'recover',tools:['lookup']},'unexpected-response':{outcome:'escalate',tools:['lookup']},
 'knowledge-conflict':{outcome:'escalate',tools:['lookup']},multilingual:{outcome:'clarify',tools:[]},
 'incorrect-assumption':{outcome:'correct',tools:['lookup']},injection:{outcome:'reject',tools:[]},
 escalation:{outcome:'escalate',tools:[]},recovery:{outcome:'recover',tools:['lookup']}
};
const make=(candidate:boolean):Transport=>({evidenceType:'fixture',async execute(s){
 const p=policy[s.category];if(!p)throw Error('Unsupported category');
 const broken=!candidate && ['tool-error','unexpected-response','knowledge-conflict'].includes(s.category);
 const outcome=broken?'grounded':p.outcome;
 return {outcome,tools:p.tools,transcript:[`User: ${s.input}`,`Fixture policy: ${outcome}. ${broken?'Unsafe baseline accepts unverified data.':'Apply documented contract boundary.'}`],credits:0};
}});
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
mkdirSync('apps/agentproof/public',{recursive:true});
for(const candidate of [false,true]){
 const r:Report={schemaVersion:1,generatedAt:new Date().toISOString(),sourceCommit,configVersion:version({policy:candidate?'corrected-fixture':'unsafe-fixture',corpusVersion:1}),results:await evaluate(corpus,make(candidate)),costs:{reportedCredits:0,scope:'Local deterministic execution only; no provider generation.'},limitations:['Intentionally scripted contract fixtures. Category metadata selects a policy; no natural-language understanding measured.','Corrected policy is an expected-contract demonstration, not independent validation of a deployed agent.','No latency, audio quality, human review, live evaluation or population reliability established.']};
 const name=candidate?'candidate':'baseline';
 for(const format of ['json','markdown','html'] as const)writeFileSync(`benchmarks/voice-ai/results/${name}.${format==='markdown'?'md':format}`,report(r,format));
 writeFileSync(`apps/agentproof/public/${name}.json`,report(r,'json'));
}
const historical=JSON.parse(readFileSync('docs/recognition/agent-experiments.json','utf8'));
writeFileSync('apps/agentproof/public/historical.json',JSON.stringify({...historical,provenance:'Imported unchanged aggregate observations from Phase 2, docs/recognition/agent-experiments.json. Not rerun in Phase 3. No transcripts or latency recorded in this artifact.'},null,2));
console.log(`Validated ${corpus.length} scenarios; wrote baseline, candidate and historical evidence.`);
