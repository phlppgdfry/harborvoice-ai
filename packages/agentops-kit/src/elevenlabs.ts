/** Structural SDK adapter: inject the official server-side client, never a browser key. */
import {inspect,type Config} from './index.js';
export interface AgentReader { conversationalAi:{ agents:{get(id:string):Promise<unknown>} } }
export async function inspectElevenLabs(client:AgentReader,id:string){
 if(!/^agent_[a-zA-Z0-9]+$/.test(id))throw Error('Expected a documented agent identifier.');
 const raw=await client.conversationalAi.agents.get(id);
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid provider configuration.');
 // JSON normalization rejects non-JSON SDK values and preserves provider field names.
 return inspect(JSON.parse(JSON.stringify(raw)) as Config);
}
