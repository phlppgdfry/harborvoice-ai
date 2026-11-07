import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {initialState, type State} from '../src/domain.js';
export function createStore(filename='var/harborvoice.sqlite'){
 if(filename!==':memory:')mkdirSync('var',{recursive:true});
 const db=new DatabaseSync(filename);db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS workspace(id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS webhook_events(id TEXT PRIMARY KEY, received_at TEXT NOT NULL, payload TEXT NOT NULL);');
 if(!db.prepare('SELECT id FROM workspace WHERE id=1').get())db.prepare('INSERT INTO workspace VALUES(1, ?)').run(JSON.stringify(initialState));
 return {read:():State=>JSON.parse((db.prepare('SELECT data FROM workspace WHERE id=1').get() as {data:string}).data),mutate<T>(fn:(s:State)=>T):T{db.exec('BEGIN IMMEDIATE');try{const state=this.read();const result=fn(state);db.prepare('UPDATE workspace SET data=? WHERE id=1').run(JSON.stringify(state));db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}},webhook(id:string,payload:string){return db.prepare('INSERT OR IGNORE INTO webhook_events VALUES(?,?,?)').run(id,new Date().toISOString(),payload).changes>0;},close:()=>db.close()};
}
export type Store=ReturnType<typeof createStore>;
