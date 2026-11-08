// Deliberately a local business-tool boundary, not an LLM or speech simulator.
const records=new Map([['HV-101',{reference:'HV-101',status:'held',gate:'B'}]]);
export function validateReference(input){
 if(typeof input!=='string'||!/^HV-\d{3}$/.test(input))throw Error('Provide a synthetic HV-000 reference.');return input;
}
export async function lookup(reference){const id=validateReference(reference);return records.get(id)??null;}
export async function handle(reference,tool=lookup){
 if(reference===undefined||reference==='')return {outcome:'clarify',message:'Which shipment reference should I check?'};
 let id;try{id=validateReference(reference);}catch{return {outcome:'reject',message:'Use an HV-000 reference.'};}
 try{
  const result=await tool(id);
  if(result===null)return {outcome:'abstain',message:'No verified record found.'};
  if(!result||result.reference!==id||!['held','released'].includes(result.status)||!['A','B'].includes(result.gate))return {outcome:'escalate',message:'The source response needs human review.'};
  return {outcome:'grounded',message:`${id}: ${result.status}, gate ${result.gate}.`};
 }catch{return {outcome:'recover',message:'The source is unavailable. No release has been confirmed.'};}
}
